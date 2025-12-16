package com.drop.domain.home.service;

import com.drop.domain.membergym.service.MemberGymService;
import com.drop.domain.home.dto.HomeSummaryDto;
import com.drop.domain.membergym.dto.MemberGymPreviewDto;
import com.drop.domain.user.gym.service.GymService;
import com.drop.global.enums.LocationMode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class HomeService {

    private final GymService gymService;
    private final MemberGymService memberGymService;

    private static final int MY_GYMS_PREVIEW_LIMIT = 5;

    @Transactional(readOnly = true)
    public HomeSummaryDto getHomeSummary(Long memberId, LocationMode locationMode, Double latGrid, Double lngGrid) {
        int nearbyGymCount = gymService.countNearbyGyms(latGrid, lngGrid);

        List<MemberGymPreviewDto> myGymsPreview = memberGymService.getMyGymsPreview(memberId);

        int totalMyGyms = memberGymService.countMyGyms(memberId);
        boolean hasMoreMyGyms = totalMyGyms > MY_GYMS_PREVIEW_LIMIT;

        LocationMode nearbyBasis = (locationMode != null) ? locationMode : LocationMode.CURRENT;

        return HomeSummaryDto.builder()
                .nearbyGymCount(nearbyGymCount)
                .nearbyBasis(nearbyBasis)
                .myGymsPreview(myGymsPreview)
                .hasMoreMyGyms(hasMoreMyGyms)
                .build();
    }
}
