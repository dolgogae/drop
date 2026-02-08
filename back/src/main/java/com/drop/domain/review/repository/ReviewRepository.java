package com.drop.domain.review.repository;

import com.drop.domain.review.data.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query(value = "SELECT r FROM Review r JOIN FETCH r.member WHERE r.crossfitBox.id = :crossfitBoxId ORDER BY r.createdAt DESC",
           countQuery = "SELECT COUNT(r) FROM Review r WHERE r.crossfitBox.id = :crossfitBoxId")
    Page<Review> findByCrossfitBoxIdWithMember(@Param("crossfitBoxId") Long crossfitBoxId, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.crossfitBox.id = :crossfitBoxId")
    Double findAverageRatingByCrossfitBoxId(@Param("crossfitBoxId") Long crossfitBoxId);

    long countByCrossfitBoxId(Long crossfitBoxId);

    @Query(value = "SELECT r FROM Review r JOIN FETCH r.crossfitBox WHERE r.member.id = :memberId ORDER BY r.createdAt DESC",
           countQuery = "SELECT COUNT(r) FROM Review r WHERE r.member.id = :memberId")
    Page<Review> findByMemberIdWithCrossfitBox(@Param("memberId") Long memberId, Pageable pageable);
}
