package com.drop.domain.home.dto;

import com.drop.domain.membercrossfitbox.dto.MemberCrossfitBoxPreviewDto;
import com.drop.global.enums.LocationMode;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeSummaryDto {
    private HomeBoxDto homeBox;
    private Integer nearbyCrossfitBoxCount;
    private LocationMode nearbyBasis;
    private List<MemberCrossfitBoxPreviewDto> myCrossfitBoxesPreview;
    private Boolean hasMoreMyCrossfitBoxes;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HomeBoxDto {
        private Long crossfitBoxId;
        private String name;
        private String addressLine1;
    }
}
