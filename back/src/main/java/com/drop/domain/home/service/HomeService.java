package com.drop.domain.home.service;

import com.drop.domain.home.dto.HomeSummaryDto;
import com.drop.domain.home.dto.MyGymPreviewDto;
import com.drop.domain.user.gym.repository.GymRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class HomeService {

    private final GymRepository gymRepository;

    private static final int MY_GYMS_PREVIEW_LIMIT = 5;
    private static final double DEFAULT_RADIUS_KM = 5.0;

    @Transactional(readOnly = true)
    public HomeSummaryDto getHomeSummary(String locationMode, Double latGrid, Double lngGrid) {
        // 근처 체육관 개수 조회
        int nearbyGymCount = countNearbyGyms(latGrid, lngGrid);

        // 내 체육관 미리보기 (TODO: 즐겨찾기 기능 구현 후 실제 데이터 조회)
        List<MyGymPreviewDto> myGymsPreview = getMyGymsPreview();

        // 더 많은 내 체육관이 있는지 (TODO: 실제 데이터로 계산)
        boolean hasMoreMyGyms = false;

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

    private List<MyGymPreviewDto> getMyGymsPreview() {
        // TODO: 즐겨찾기/내 체육관 기능 구현 후 실제 데이터 조회
        // 현재는 빈 리스트 반환
        return Collections.emptyList();
    }
}
