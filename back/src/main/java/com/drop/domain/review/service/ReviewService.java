package com.drop.domain.review.service;

import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.repository.CrossfitBoxRepository;
import com.drop.domain.member.data.Member;
import com.drop.domain.member.repository.MemberRepository;
import com.drop.domain.review.data.Review;
import com.drop.domain.review.dto.MyReviewListResponseDto;
import com.drop.domain.review.dto.MyReviewResponseDto;
import com.drop.domain.review.dto.ReviewListResponseDto;
import com.drop.domain.review.dto.ReviewRequestDto;
import com.drop.domain.review.dto.ReviewResponseDto;
import com.drop.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MemberRepository memberRepository;
    private final CrossfitBoxRepository crossfitBoxRepository;

    @Transactional(readOnly = true)
    public MyReviewListResponseDto getMyReviews(Long memberId, int page, int size) {
        Page<Review> reviewPage = reviewRepository.findByMemberIdWithCrossfitBox(memberId, PageRequest.of(page, size));

        List<MyReviewResponseDto> reviewDtos = reviewPage.getContent().stream()
                .map(this::toMyReviewResponseDto)
                .collect(Collectors.toList());

        return MyReviewListResponseDto.builder()
                .reviews(reviewDtos)
                .currentPage(reviewPage.getNumber())
                .totalPages(reviewPage.getTotalPages())
                .hasNext(reviewPage.hasNext())
                .build();
    }

    @Transactional(readOnly = true)
    public ReviewListResponseDto getReviewsByCrossfitBoxId(Long crossfitBoxId, int page, int size) {
        Page<Review> reviewPage = reviewRepository.findByCrossfitBoxIdWithMember(crossfitBoxId, PageRequest.of(page, size));
        Double averageRating = reviewRepository.findAverageRatingByCrossfitBoxId(crossfitBoxId);
        long reviewCount = reviewRepository.countByCrossfitBoxId(crossfitBoxId);

        List<ReviewResponseDto> reviewDtos = reviewPage.getContent().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());

        return ReviewListResponseDto.builder()
                .averageRating(averageRating != null ? Math.round(averageRating * 10) / 10.0 : 0.0)
                .reviewCount(reviewCount)
                .reviews(reviewDtos)
                .currentPage(reviewPage.getNumber())
                .totalPages(reviewPage.getTotalPages())
                .hasNext(reviewPage.hasNext())
                .build();
    }

    @Transactional
    public ReviewResponseDto createReview(Long memberId, Long crossfitBoxId, ReviewRequestDto request) {
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("평점은 1~5 사이의 값이어야 합니다.");
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        CrossfitBox crossfitBox = crossfitBoxRepository.findById(crossfitBoxId)
                .orElseThrow(() -> new IllegalArgumentException("크로스핏박스를 찾을 수 없습니다."));

        Review review = Review.create(member, crossfitBox, request.getRating(), request.getContent());
        Review saved = reviewRepository.save(review);

        return toResponseDto(saved);
    }

    @Transactional
    public ReviewResponseDto updateReview(Long memberId, Long reviewId, ReviewRequestDto request) {
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("평점은 1~5 사이의 값이어야 합니다.");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        if (!review.getMember().getId().equals(memberId)) {
            throw new IllegalArgumentException("본인의 리뷰만 수정할 수 있습니다.");
        }

        review.update(request.getRating(), request.getContent());
        return toResponseDto(review);
    }

    @Transactional
    public void deleteReview(Long memberId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        if (!review.getMember().getId().equals(memberId)) {
            throw new IllegalArgumentException("본인의 리뷰만 삭제할 수 있습니다.");
        }

        reviewRepository.delete(review);
    }

    private MyReviewResponseDto toMyReviewResponseDto(Review review) {
        return MyReviewResponseDto.builder()
                .reviewId(review.getId())
                .rating(review.getRating())
                .content(review.getContent())
                .crossfitBoxId(review.getCrossfitBox().getId())
                .crossfitBoxName(review.getCrossfitBox().getName())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    private ReviewResponseDto toResponseDto(Review review) {
        Member member = review.getMember();
        return ReviewResponseDto.builder()
                .reviewId(review.getId())
                .memberId(member.getId())
                .memberUsername(member.getUsername())
                .memberProfileImage(member.getProfileImage())
                .rating(review.getRating())
                .content(review.getContent())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
