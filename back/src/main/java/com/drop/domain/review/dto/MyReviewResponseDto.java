package com.drop.domain.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyReviewResponseDto {
    private Long reviewId;
    private Integer rating;
    private String content;
    private Long crossfitBoxId;
    private String crossfitBoxName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
