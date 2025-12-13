package com.drop.domain.home.dto;

import com.drop.domain.membergym.dto.MemberGymPreviewDto;
import com.drop.global.enums.LocationMode;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeSummaryDto {
    private Integer nearbyGymCount;
    private LocationMode nearbyBasis;
    private List<MemberGymPreviewDto> myGymsPreview;
    private Boolean hasMoreMyGyms;
}
