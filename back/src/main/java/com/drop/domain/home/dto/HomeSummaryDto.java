package com.drop.domain.home.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeSummaryDto {
    private Integer nearbyGymCount;
    private String nearbyBasis;  // "current" | "last"
    private List<MyGymPreviewDto> myGymsPreview;
    private Boolean hasMoreMyGyms;
}
