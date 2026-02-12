package com.drop.domain.gymsync.service;

import com.drop.domain.gymsync.config.GymSyncProperties;
import com.drop.domain.gymsync.config.RegionConfig;
import com.drop.domain.gymsync.dto.PlaceDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.Yaml;

import javax.annotation.PostConstruct;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegionSearchService {

    private final GooglePlacesApiService googlePlacesApiService;
    private final RegionConfig regionConfig;
    private final GymSyncProperties batchProperties;

    private Map<String, Object> administrativeDivisions = new HashMap<>();

    private static final long REGION_DELAY_MS = 2000;

    @PostConstruct
    public void init() {
        try {
            Yaml yaml = new Yaml();
            InputStream inputStream = new ClassPathResource("config/administrative-divisions.yml").getInputStream();
            Map<String, Object> root = yaml.load(inputStream);
            @SuppressWarnings("unchecked")
            Map<String, Object> divisions = (Map<String, Object>) root.get("divisions");
            if (divisions != null) {
                this.administrativeDivisions = divisions;
            }
            log.info("행정구역 매핑 로드 완료 - {}개 시/도", administrativeDivisions.size());
        } catch (Exception e) {
            log.error("administrative-divisions.yml 로드 실패", e);
        }
    }

    public List<PlaceDto> searchAllRegions() {
        List<PlaceDto> allResults = new ArrayList<>();
        int regionCount = 0;

        // Level 1 검색 (광역 단위)
        for (Map<String, Object> region : regionConfig.getLevel1Regions()) {
            String name = (String) region.get("name");
            @SuppressWarnings("unchecked")
            List<String> queries = (List<String>) region.get("queries");

            log.info("Level 1 검색 시작 - 지역: {}", name);

            List<PlaceDto> regionResults = new ArrayList<>();
            if (queries != null) {
                for (String query : queries) {
                    List<PlaceDto> results = googlePlacesApiService.textSearch(query, name);
                    regionResults.addAll(results);
                    sleep(REGION_DELAY_MS);
                }
            }

            // 세분화 체크
            if (shouldSubdivide(regionResults.size())) {
                log.warn("Level 1 세분화 트리거 - 지역: {}, 결과: {}건", name, regionResults.size());
                List<PlaceDto> subdivided = subdivideSearch(name, name);
                if (!subdivided.isEmpty()) {
                    regionResults = subdivided;
                }
            }

            allResults.addAll(regionResults);
            regionCount++;
            log.info("Level 1 검색 완료 - 지역: {}, 결과: {}건", name, regionResults.size());
        }

        // Level 2 검색 (시/군/구 단위)
        for (Map<String, Object> region : regionConfig.getLevel2Regions()) {
            String name = (String) region.get("name");
            String queryTemplate = (String) region.get("queryTemplate");
            @SuppressWarnings("unchecked")
            List<String> subRegions = (List<String>) region.get("subRegions");

            if (subRegions == null || queryTemplate == null) continue;

            log.info("Level 2 검색 시작 - 지역: {}, 하위 {}개 지역", name, subRegions.size());

            for (String subRegion : subRegions) {
                String query = queryTemplate.replace("{subRegion}", subRegion);
                String regionLabel = subRegion + " " + name;

                List<PlaceDto> results = googlePlacesApiService.textSearch(query, regionLabel);

                // 세분화 체크
                if (shouldSubdivide(results.size())) {
                    log.warn("Level 2 세분화 트리거 - 지역: {}, 결과: {}건", regionLabel, results.size());
                    List<PlaceDto> subdivided = subdivideSearch(subRegion, name);
                    if (!subdivided.isEmpty()) {
                        results = subdivided;
                    }
                }

                allResults.addAll(results);
                regionCount++;
                sleep(REGION_DELAY_MS);
            }

            log.info("Level 2 검색 완료 - 지역: {}", name);
        }

        log.info("전체 지역 검색 완료 - 검색 지역: {}개, 총 결과: {}건", regionCount, allResults.size());
        return allResults;
    }

    public int getTotalRegionCount() {
        int count = regionConfig.getLevel1Regions().size();
        for (Map<String, Object> region : regionConfig.getLevel2Regions()) {
            @SuppressWarnings("unchecked")
            List<String> subRegions = (List<String>) region.get("subRegions");
            if (subRegions != null) {
                count += subRegions.size();
            }
        }
        return count;
    }

    private boolean shouldSubdivide(int resultCount) {
        return batchProperties.getAutoSubdivision().isEnabled()
                && resultCount >= batchProperties.getAutoSubdivision().getThreshold();
    }

    private List<PlaceDto> subdivideSearch(String subRegion, String parentRegion) {
        List<String> childRegions = findChildRegions(subRegion);
        if (childRegions.isEmpty()) {
            log.debug("하위 행정구역 없음 - 지역: {}", subRegion);
            return Collections.emptyList();
        }

        log.info("세분화 검색 시작 - {} → {}개 하위 지역", subRegion, childRegions.size());
        List<PlaceDto> subdivided = new ArrayList<>();

        for (String child : childRegions) {
            String query = "CrossFit gym in " + child + " " + subRegion;
            String regionLabel = child + " " + subRegion + " " + parentRegion;
            List<PlaceDto> results = googlePlacesApiService.textSearch(query, regionLabel);
            subdivided.addAll(results);
            sleep(REGION_DELAY_MS);
        }

        log.info("세분화 검색 완료 - {} → 총 {}건", subRegion, subdivided.size());
        return subdivided;
    }

    @SuppressWarnings("unchecked")
    private List<String> findChildRegions(String regionName) {
        // 행정구역 매핑에서 하위 지역 찾기
        for (Map.Entry<String, Object> entry : administrativeDivisions.entrySet()) {
            Map<String, Object> sido = (Map<String, Object>) entry.getValue();
            Map<String, Object> children = (Map<String, Object>) sido.get("children");
            if (children == null) continue;

            if (children.containsKey(regionName)) {
                Object childData = children.get(regionName);
                return extractChildNames(childData);
            }

            // 시군구 하위의 구 레벨 탐색
            for (Map.Entry<String, Object> sigungu : children.entrySet()) {
                Object value = sigungu.getValue();
                if (value instanceof Map) {
                    Map<String, Object> sigunguMap = (Map<String, Object>) value;
                    Object grandChildrenObj = sigunguMap.get("children");
                    if (grandChildrenObj instanceof Map) {
                        Map<String, Object> grandChildren = (Map<String, Object>) grandChildrenObj;
                        if (grandChildren.containsKey(regionName)) {
                            Object childData = grandChildren.get(regionName);
                            return extractChildNames(childData);
                        }
                    }
                }
            }
        }

        return Collections.emptyList();
    }

    @SuppressWarnings("unchecked")
    private List<String> extractChildNames(Object childData) {
        if (childData instanceof Map) {
            Map<String, Object> childMap = (Map<String, Object>) childData;
            Object childChildren = childMap.get("children");
            if (childChildren instanceof List) {
                return (List<String>) childChildren;
            } else if (childChildren instanceof Map) {
                return new ArrayList<>(((Map<String, Object>) childChildren).keySet());
            }
        } else if (childData instanceof List) {
            return (List<String>) childData;
        }
        return Collections.emptyList();
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("대기 중 인터럽트 발생");
        }
    }
}
