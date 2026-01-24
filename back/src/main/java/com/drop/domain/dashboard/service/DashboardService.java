package com.drop.domain.dashboard.service;

import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.member.data.Member;
import com.drop.domain.member.repository.MemberRepository;
import com.drop.domain.membercrossfitbox.service.MemberCrossfitBoxService;
import com.drop.domain.dashboard.dto.DashboardSummaryDto;
import com.drop.domain.membercrossfitbox.dto.MemberCrossfitBoxPreviewDto;
import com.drop.domain.crossfitbox.service.CrossfitBoxService;
import com.drop.global.enums.LocationMode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CrossfitBoxService crossfitBoxService;
    private final MemberCrossfitBoxService memberCrossfitBoxService;
    private final MemberRepository memberRepository;

    private static final int MY_CROSSFIT_BOXES_PREVIEW_LIMIT = 5;

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary(Long memberId, LocationMode locationMode, Double latGrid, Double lngGrid) {
        int nearbyCrossfitBoxCount = crossfitBoxService.countNearbyCrossfitBoxes(latGrid, lngGrid);

        List<MemberCrossfitBoxPreviewDto> myCrossfitBoxesPreview = memberCrossfitBoxService.getMyCrossfitBoxesPreview(memberId);

        int totalMyCrossfitBoxes = memberCrossfitBoxService.countMyCrossfitBoxes(memberId);
        boolean hasMoreMyCrossfitBoxes = totalMyCrossfitBoxes > MY_CROSSFIT_BOXES_PREVIEW_LIMIT;

        LocationMode nearbyBasis = (locationMode != null) ? locationMode : LocationMode.CURRENT;

        DashboardSummaryDto.DashboardBoxDto dashboardBoxDto = null;
        Member member = memberRepository.findById(memberId).orElse(null);
        if (member != null && member.getHomeBox() != null) {
            CrossfitBox homeBox = member.getHomeBox();
            dashboardBoxDto = DashboardSummaryDto.DashboardBoxDto.builder()
                    .crossfitBoxId(homeBox.getId())
                    .name(homeBox.getName())
                    .addressLine1(homeBox.getAddress() != null ? homeBox.getAddress().getAddressLine1() : null)
                    .build();
        }

        return DashboardSummaryDto.builder()
                .homeBox(dashboardBoxDto)
                .nearbyCrossfitBoxCount(nearbyCrossfitBoxCount)
                .nearbyBasis(nearbyBasis)
                .myCrossfitBoxesPreview(myCrossfitBoxesPreview)
                .hasMoreMyCrossfitBoxes(hasMoreMyCrossfitBoxes)
                .build();
    }
}
