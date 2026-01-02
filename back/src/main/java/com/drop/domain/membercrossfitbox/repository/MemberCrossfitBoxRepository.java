package com.drop.domain.membercrossfitbox.repository;

import com.drop.domain.membercrossfitbox.data.MemberCrossfitBox;
import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.member.data.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MemberCrossfitBoxRepository extends JpaRepository<MemberCrossfitBox, Long> {

    Optional<MemberCrossfitBox> findByMemberAndCrossfitBox(Member member, CrossfitBox crossfitBox);

    List<MemberCrossfitBox> findByMemberOrderByIsFavoriteDescCreatedAtDesc(Member member);

    @Query("SELECT mcb FROM MemberCrossfitBox mcb JOIN FETCH mcb.crossfitBox WHERE mcb.member = :member ORDER BY mcb.isFavorite DESC, mcb.createdAt DESC")
    List<MemberCrossfitBox> findByMemberWithCrossfitBox(@Param("member") Member member);

    @Query("SELECT mcb FROM MemberCrossfitBox mcb JOIN FETCH mcb.crossfitBox WHERE mcb.member.id = :memberId ORDER BY mcb.isFavorite DESC, mcb.createdAt DESC")
    List<MemberCrossfitBox> findByMemberIdWithCrossfitBox(@Param("memberId") Long memberId);

    @Query("SELECT mcb FROM MemberCrossfitBox mcb LEFT JOIN FETCH mcb.crossfitBox WHERE mcb.member.id = :memberId ORDER BY mcb.isFavorite DESC, mcb.createdAt DESC")
    List<MemberCrossfitBox> findByMemberIdWithCrossfitBoxIncludeDeleted(@Param("memberId") Long memberId);

    @Query("SELECT COUNT(mcb) FROM MemberCrossfitBox mcb WHERE mcb.member.id = :memberId")
    int countByMemberId(@Param("memberId") Long memberId);

    boolean existsByMemberAndCrossfitBox(Member member, CrossfitBox crossfitBox);

    void deleteByMemberAndCrossfitBox(Member member, CrossfitBox crossfitBox);
}
