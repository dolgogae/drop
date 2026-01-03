package com.drop.domain.home.service;

import com.drop.domain.membercrossfitbox.service.MemberCrossfitBoxService;
import com.drop.domain.home.dto.HomeSummaryDto;
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
public class HomeService {

    private final CrossfitBoxService crossfitBoxService;
    private final MemberCrossfitBoxService memberCrossfitBoxService;

    private static final int MY_CROSSFIT_BOXES_PREVIEW_LIMIT = 5;

    @Transactional(readOnly = true)
    public HomeSummaryDto getHomeSummary(Long memberId, LocationMode locationMode, Double latGrid, Double lngGrid) {
        int nearbyCrossfitBoxCount = crossfitBoxService.countNearbyCrossfitBoxes(latGrid, lngGrid);

        List<MemberCrossfitBoxPreviewDto> myCrossfitBoxesPreview = memberCrossfitBoxService.getMyCrossfitBoxesPreview(memberId);

        int totalMyCrossfitBoxes = memberCrossfitBoxService.countMyCrossfitBoxes(memberId);
        boolean hasMoreMyCrossfitBoxes = totalMyCrossfitBoxes > MY_CROSSFIT_BOXES_PREVIEW_LIMIT;

        LocationMode nearbyBasis = (locationMode != null) ? locationMode : LocationMode.CURRENT;

        return HomeSummaryDto.builder()
                .nearbyCrossfitBoxCount(nearbyCrossfitBoxCount)
                .nearbyBasis(nearbyBasis)
                .myCrossfitBoxesPreview(myCrossfitBoxesPreview)
                .hasMoreMyCrossfitBoxes(hasMoreMyCrossfitBoxes)
                .build();
    }
}
