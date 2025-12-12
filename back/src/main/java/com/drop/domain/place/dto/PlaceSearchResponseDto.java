package com.drop.domain.place.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PlaceSearchResponseDto {
    private List<PlaceDto> places;
    private Integer count;
    private Integer totalCount;
    private Boolean hasMore;
}
