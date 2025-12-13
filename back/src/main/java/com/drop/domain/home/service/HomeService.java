package com.drop.domain.home.service;

import com.drop.domain.favorite.data.MemberGym;
import com.drop.domain.favorite.repository.MemberGymRepository;
import com.drop.domain.home.dto.HomeSummaryDto;
import com.drop.domain.home.dto.MyGymPreviewDto;
import com.drop.domain.user.gym.repository.GymRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HomeService {

    private final GymRepository gymRepository;
    private final MemberGymRepository memberGymRepository;

    private static final int MY_GYMS_PREVIEW_LIMIT = 5;
    private static final double DEFAULT_RADIUS_KM = 5.0;

    @Transactional(readOnly = true)
    public HomeSummaryDto getHomeSummary(Long memberId, String locationMode, Double latGrid, Double lngGrid) {
        // 근처 체육관 개수 조회
        int nearbyGymCount = countNearbyGyms(latGrid, lngGrid);

        // 내 체육관 미리보기
        List<MyGymPreviewDto> myGymsPreview = getMyGymsPreview(memberId);

        // 더 많은 내 체육관이 있는지
        int totalMyGyms = (memberId != null) ? memberGymRepository.countByMemberId(memberId) : 0;
        boolean hasMoreMyGyms = totalMyGyms > MY_GYMS_PREVIEW_LIMIT;

        String nearbyBasis = (locationMode != null) ? locationMode : "current";

        return HomeSummaryDto.builder()
                .nearbyGymCount(nearbyGymCount)
                .nearbyBasis(nearbyBasis)
                .myGymsPreview(myGymsPreview)
                .hasMoreMyGyms(hasMoreMyGyms)
                .build();
    }

    private int countNearbyGyms(Double latGrid, Double lngGrid) {
        if (latGrid == null || lngGrid == null) {
            // 위치 정보가 없으면 전체 체육관 개수 반환
            return (int) gymRepository.count();
        }

        // 근처 체육관 개수 계산 (간단한 bounding box 방식)
        double deltaLat = DEFAULT_RADIUS_KM / 111.0;  // 약 111km per degree latitude
        double deltaLng = DEFAULT_RADIUS_KM / (111.0 * Math.cos(Math.toRadians(latGrid)));

        double swLat = latGrid - deltaLat;
        double neLat = latGrid + deltaLat;
        double swLng = lngGrid - deltaLng;
        double neLng = lngGrid + deltaLng;

        return gymRepository.findByBounds(swLat, swLng, neLat, neLng).size();
    }

    private List<MyGymPreviewDto> getMyGymsPreview(Long memberId) {
        if (memberId == null) {
            return Collections.emptyList();
        }

        List<MemberGym> memberGyms = memberGymRepository.findByMemberIdWithGymIncludeDeleted(memberId);

        return memberGyms.stream()
                .limit(MY_GYMS_PREVIEW_LIMIT)
                .map(mg -> {
                    boolean isDeleted = mg.getGym() == null;
                    return MyGymPreviewDto.builder()
                            .gymId(isDeleted ? mg.getId() : mg.getGym().getId())
                            .name(isDeleted ? "삭제된 체육관" : mg.getGym().getName())
                            .isFavorite(mg.getIsFavorite())
                            .isDeleted(isDeleted)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
