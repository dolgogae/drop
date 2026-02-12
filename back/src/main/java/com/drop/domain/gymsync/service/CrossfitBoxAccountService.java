package com.drop.domain.gymsync.service;

import com.drop.domain.gymsync.data.InactiveGymCandidate;
import com.drop.domain.gymsync.dto.PlaceDto;
import com.drop.domain.gymsync.repository.InactiveGymCandidateRepository;
import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.repository.CrossfitBoxRepository;
import com.drop.global.enums.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrossfitBoxAccountService {

    private final GoogleTranslateService googleTranslateService;
    private final CrossfitBoxRepository crossfitBoxRepository;
    private final InactiveGymCandidateRepository inactiveGymCandidateRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Map<String, Object> createAccounts(List<PlaceDto> places) {
        int created = 0;
        int skipped = 0;
        int failed = 0;

        for (PlaceDto place : places) {
            try {
                String username = googleTranslateService.translateToUsername(place.getName());
                String email = username + "@drop.com";

                if (crossfitBoxRepository.existsByEmail(email)) {
                    log.info("이미 존재하는 계정 skip - email: {}", email);
                    skipped++;
                    continue;
                }

                String password = passwordEncoder.encode(username + "1!");

                CrossfitBox crossfitBox = CrossfitBox.builder()
                        .username(username)
                        .email(email)
                        .password(password)
                        .role(UserRole.GYM)
                        .name(place.getName())
                        .phoneNumber(place.getPhoneNumber())
                        .etcInfo(place.getFormattedAddress())
                        .latitude(place.getLatitude())
                        .longitude(place.getLongitude())
                        .build();

                crossfitBoxRepository.save(crossfitBox);
                log.info("계정 생성 완료 - name: {}, username: {}, email: {}", place.getName(), username, email);
                created++;

            } catch (Exception e) {
                log.error("계정 생성 실패 - name: {}, error: {}", place.getName(), e.getMessage());
                failed++;
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", places.size());
        result.put("created", created);
        result.put("skipped", skipped);
        result.put("failed", failed);

        log.info("계정 생성 배치 완료 - total: {}, created: {}, skipped: {}, failed: {}",
                places.size(), created, skipped, failed);

        return result;
    }

    private static final double NEARBY_THRESHOLD_KM = 1.0;

    @Transactional
    public Map<String, Object> syncWithPlaces(List<PlaceDto> places) {
        int created = 0;
        int skipped = 0;
        int inactive = 0;
        int failed = 0;

        // 1. DB에서 전체 CrossfitBox 조회 (이름 기준 그룹핑 — 동명이인 처리)
        List<CrossfitBox> existingBoxes = crossfitBoxRepository.findAll();
        Map<String, List<CrossfitBox>> existingByName = existingBoxes.stream()
                .filter(box -> box.getName() != null)
                .collect(Collectors.groupingBy(CrossfitBox::getName));

        // 2. 매칭된 Box ID 추적
        Set<Long> matchedBoxIds = new HashSet<>();

        // 3. 신규 Box → 계정 생성
        for (PlaceDto place : places) {
            List<CrossfitBox> sameNameBoxes = existingByName.getOrDefault(place.getName(), Collections.emptyList());

            // 같은 이름 + 근접 좌표인 Box가 있으면 skip
            Optional<CrossfitBox> matched = sameNameBoxes.stream()
                    .filter(box -> isNearby(box, place))
                    .findFirst();

            if (matched.isPresent()) {
                matchedBoxIds.add(matched.get().getId());
                log.info("이미 존재하는 Box skip - name: {}", place.getName());
                skipped++;
                continue;
            }

            try {
                String baseUsername = googleTranslateService.translateToUsername(place.getName());
                String username = baseUsername;
                String email = username + "@drop.com";

                // 이메일 중복 시 숫자 suffix 추가 (동명 Box 처리)
                int suffix = 2;
                while (crossfitBoxRepository.existsByEmail(email)) {
                    username = baseUsername + "-" + suffix;
                    email = username + "@drop.com";
                    suffix++;
                }

                String password = passwordEncoder.encode(username + "1!");

                CrossfitBox crossfitBox = CrossfitBox.builder()
                        .username(username)
                        .email(email)
                        .password(password)
                        .role(UserRole.GYM)
                        .name(place.getName())
                        .phoneNumber(place.getPhoneNumber())
                        .etcInfo(place.getFormattedAddress())
                        .latitude(place.getLatitude())
                        .longitude(place.getLongitude())
                        .build();

                crossfitBoxRepository.save(crossfitBox);
                log.info("계정 생성 완료 - name: {}, username: {}, email: {}", place.getName(), username, email);
                created++;

            } catch (Exception e) {
                log.error("계정 생성 실패 - name: {}, error: {}", place.getName(), e.getMessage());
                failed++;
            }
        }

        // 4. 누락된 Box → InactiveGymCandidate 저장
        LocalDate today = LocalDate.now();
        for (CrossfitBox box : existingBoxes) {
            if (box.getName() == null) continue;
            if (matchedBoxIds.contains(box.getId())) continue;

            try {
                if (inactiveGymCandidateRepository.existsByCrossfitBoxId(box.getId())) {
                    log.info("이미 영업종료 후보로 등록된 Box skip - name: {}", box.getName());
                    continue;
                }

                InactiveGymCandidate candidate = InactiveGymCandidate.builder()
                        .crossfitBox(box)
                        .detectedAt(today)
                        .build();

                inactiveGymCandidateRepository.save(candidate);
                log.info("영업종료 후보 등록 - name: {}", box.getName());
                inactive++;
            } catch (Exception e) {
                log.error("영업종료 후보 등록 실패 - name: {}, error: {}", box.getName(), e.getMessage());
                failed++;
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", places.size());
        result.put("created", created);
        result.put("skipped", skipped);
        result.put("inactive", inactive);
        result.put("failed", failed);

        log.info("동기화 배치 완료 - total: {}, created: {}, skipped: {}, inactive: {}, failed: {}",
                places.size(), created, skipped, inactive, failed);

        return result;
    }

    private boolean isNearby(CrossfitBox box, PlaceDto place) {
        if (box.getLatitude() == null || box.getLongitude() == null
                || place.getLatitude() == null || place.getLongitude() == null) {
            // 좌표 없으면 이름만으로 매칭
            return true;
        }
        double distanceKm = haversineKm(
                box.getLatitude(), box.getLongitude(),
                place.getLatitude(), place.getLongitude());
        return distanceKm <= NEARBY_THRESHOLD_KM;
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
