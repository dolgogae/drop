package com.drop.domain.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyReviewListResponseDto {
    private List<MyReviewResponseDto> reviews;
    private int currentPage;
    private int totalPages;
    private boolean hasNext;
}
