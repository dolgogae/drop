package com.drop.domain.gymsync.service;

import com.drop.domain.gymsync.config.FilterRuleConfig;
import com.drop.domain.gymsync.dto.FilterStatsDto;
import com.drop.domain.gymsync.dto.PlaceDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlaceFilterService {

    private final FilterRuleConfig filterRuleConfig;

    private static final Pattern CF_PATTERN = Pattern.compile("CF\\s+\\w+", Pattern.CASE_INSENSITIVE);

    public FilterResult filter(List<PlaceDto> places) {
        int totalInput = places.size();
        int includedByKeyword = 0;
        int excludedByKeyword = 0;
        int excludedByType = 0;

        List<PlaceDto> filtered = new ArrayList<>();

        for (PlaceDto place : places) {
            // 포함 조건 체크
            if (matchesIncludeRules(place)) {
                // 포함 키워드가 있으면 제외 조건 무시
                filtered.add(place);
                includedByKeyword++;
                continue;
            }

            // 제외 조건 체크 - 키워드
            if (matchesExcludeKeywords(place)) {
                log.debug("키워드 제외 - name: {}", place.getName());
                excludedByKeyword++;
                continue;
            }

            // 제외 조건 체크 - Google Types
            if (matchesExcludeTypes(place)) {
                log.debug("타입 제외 - name: {}, types: {}", place.getName(), place.getTypesAsString());
                excludedByType++;
                continue;
            }

            filtered.add(place);
        }

        // 중복 제거
        int beforeDedup = filtered.size();
        filtered = removeDuplicates(filtered);
        int duplicatesRemoved = beforeDedup - filtered.size();

        FilterStatsDto stats = FilterStatsDto.builder()
                .totalInput(totalInput)
                .includedByKeyword(includedByKeyword)
                .excludedByKeyword(excludedByKeyword)
                .excludedByType(excludedByType)
                .duplicatesRemoved(duplicatesRemoved)
                .finalOutput(filtered.size())
                .build();

        log.info("필터링 완료 - 입력: {}건, 키워드 포함: {}건, 키워드 제외: {}건, 타입 제외: {}건, 중복 제거: {}건, 최종: {}건",
                totalInput, includedByKeyword, excludedByKeyword, excludedByType, duplicatesRemoved, filtered.size());

        return new FilterResult(filtered, stats);
    }

    private boolean matchesIncludeRules(PlaceDto place) {
        if (place.getName() == null) return false;
        String name = place.getName().toLowerCase();
        String nameNoSpaces = name.replace(" ", "");

        // Rule 1: 직접 키워드 매칭 (띄어쓰기 무시)
        for (String keyword : filterRuleConfig.getIncludeKeywords()) {
            String keywordNoSpaces = keyword.toLowerCase().replace(" ", "");
            if (nameNoSpaces.contains(keywordNoSpaces)) {
                return true;
            }
        }

        // Rule 2: CF + 공백 + 단어 패턴
        if (CF_PATTERN.matcher(place.getName()).find()) {
            return true;
        }

        // Rule 3: CF + gym/box 조합
        for (String cfKw : filterRuleConfig.getCfKeywords()) {
            if (name.contains(cfKw.toLowerCase())) {
                for (String gymKw : filterRuleConfig.getGymKeywords()) {
                    if (name.contains(gymKw.toLowerCase())) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private boolean matchesExcludeKeywords(PlaceDto place) {
        if (place.getName() == null) return false;
        String name = place.getName().toLowerCase();
        String nameNoSpaces = name.replace(" ", "");

        for (String keyword : filterRuleConfig.getExcludeKeywords()) {
            String keywordNoSpaces = keyword.toLowerCase().replace(" ", "");
            if (nameNoSpaces.contains(keywordNoSpaces)) {
                return true;
            }
        }

        return false;
    }

    private boolean matchesExcludeTypes(PlaceDto place) {
        if (place.getTypes() == null || place.getTypes().isEmpty()) return false;

        boolean hasGym = place.getTypes().stream()
                .anyMatch(t -> t.equalsIgnoreCase("gym"));

        if (hasGym) return false;

        for (String type : place.getTypes()) {
            for (String excludeType : filterRuleConfig.getExcludeGoogleTypes()) {
                if (type.equalsIgnoreCase(excludeType)) {
                    return true;
                }
            }
        }

        return false;
    }

    private List<PlaceDto> removeDuplicates(List<PlaceDto> places) {
        Map<String, PlaceDto> uniqueByPlaceId = new HashMap<>();
        List<PlaceDto> result = new ArrayList<>();

        for (PlaceDto place : places) {
            if (place.getPlaceId() == null) {
                result.add(place);
                continue;
            }

            // Primary: place_id 기준 중복 제거
            if (uniqueByPlaceId.containsKey(place.getPlaceId())) {
                log.debug("place_id 중복 제거 - name: {}, placeId: {}", place.getName(), place.getPlaceId());
                continue;
            }

            // Secondary: 이름 유사도 + 주소 동일 체크
            boolean isDuplicate = false;
            for (PlaceDto existing : uniqueByPlaceId.values()) {
                if (isSimilarPlace(place, existing)) {
                    log.debug("유사 장소 중복 제거 - name1: {}, name2: {}", place.getName(), existing.getName());
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                uniqueByPlaceId.put(place.getPlaceId(), place);
                result.add(place);
            }
        }

        return result;
    }

    private boolean isSimilarPlace(PlaceDto a, PlaceDto b) {
        if (a.getFormattedAddress() == null || b.getFormattedAddress() == null) return false;
        if (!a.getFormattedAddress().equals(b.getFormattedAddress())) return false;

        if (a.getName() == null || b.getName() == null) return false;

        double similarity = calculateSimilarity(a.getName(), b.getName());
        return similarity >= filterRuleConfig.getSimilarityThreshold();
    }

    /**
     * 레벤슈타인 거리 기반 유사도 계산 (0.0 ~ 1.0)
     */
    private double calculateSimilarity(String s1, String s2) {
        if (s1.equals(s2)) return 1.0;

        int maxLen = Math.max(s1.length(), s2.length());
        if (maxLen == 0) return 1.0;

        int distance = levenshteinDistance(s1, s2);
        return 1.0 - ((double) distance / maxLen);
    }

    private int levenshteinDistance(String s1, String s2) {
        int len1 = s1.length();
        int len2 = s2.length();
        int[][] dp = new int[len1 + 1][len2 + 1];

        for (int i = 0; i <= len1; i++) dp[i][0] = i;
        for (int j = 0; j <= len2; j++) dp[0][j] = j;

        for (int i = 1; i <= len1; i++) {
            for (int j = 1; j <= len2; j++) {
                int cost = s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(Math.min(
                        dp[i - 1][j] + 1,
                        dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + cost);
            }
        }

        return dp[len1][len2];
    }

    public static class FilterResult {
        private final List<PlaceDto> places;
        private final FilterStatsDto stats;

        public FilterResult(List<PlaceDto> places, FilterStatsDto stats) {
            this.places = places;
            this.stats = stats;
        }

        public List<PlaceDto> getPlaces() {
            return places;
        }

        public FilterStatsDto getStats() {
            return stats;
        }
    }
}
