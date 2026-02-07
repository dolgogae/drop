package com.drop.domain.review.controller;

import com.drop.domain.review.dto.ReviewListResponseDto;
import com.drop.domain.review.dto.ReviewRequestDto;
import com.drop.domain.review.dto.ReviewResponseDto;
import com.drop.domain.review.service.ReviewService;
import com.drop.global.code.result.ResultCode;
import com.drop.global.code.result.ResultResponse;
import com.drop.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Review", description = "리뷰 API")
@RestController
@RequestMapping("/crossfit-boxes/{crossfitBoxId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @Operation(summary = "리뷰 목록 조회")
    @GetMapping
    public ResponseEntity<ResultResponse> getReviews(
            @PathVariable Long crossfitBoxId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        ReviewListResponseDto result = reviewService.getReviewsByCrossfitBoxId(crossfitBoxId, page, size);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.REVIEW_LIST_SUCCESS, result));
    }

    @Operation(summary = "리뷰 작성")
    @PostMapping
    public ResponseEntity<ResultResponse> createReview(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long crossfitBoxId,
            @RequestBody ReviewRequestDto request
    ) {
        Long memberId = userDetails.getId();
        ReviewResponseDto result = reviewService.createReview(memberId, crossfitBoxId, request);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.REVIEW_CREATE_SUCCESS, result));
    }

    @Operation(summary = "리뷰 수정")
    @PatchMapping("/{reviewId}")
    public ResponseEntity<ResultResponse> updateReview(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long crossfitBoxId,
            @PathVariable Long reviewId,
            @RequestBody ReviewRequestDto request
    ) {
        Long memberId = userDetails.getId();
        ReviewResponseDto result = reviewService.updateReview(memberId, reviewId, request);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.REVIEW_UPDATE_SUCCESS, result));
    }

    @Operation(summary = "리뷰 삭제")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ResultResponse> deleteReview(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long crossfitBoxId,
            @PathVariable Long reviewId
    ) {
        Long memberId = userDetails.getId();
        reviewService.deleteReview(memberId, reviewId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.REVIEW_DELETE_SUCCESS, null));
    }
}
