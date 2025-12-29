package com.drop.domain.membergym.repository;

import com.drop.domain.membergym.data.MemberGym;
import com.drop.domain.gym.data.Gym;
import com.drop.domain.member.data.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MemberGymRepository extends JpaRepository<MemberGym, Long> {

    Optional<MemberGym> findByMemberAndGym(Member member, Gym gym);

    List<MemberGym> findByMemberOrderByIsFavoriteDescCreatedAtDesc(Member member);

    @Query("SELECT mg FROM MemberGym mg JOIN FETCH mg.gym WHERE mg.member = :member ORDER BY mg.isFavorite DESC, mg.createdAt DESC")
    List<MemberGym> findByMemberWithGym(@Param("member") Member member);

    @Query("SELECT mg FROM MemberGym mg JOIN FETCH mg.gym WHERE mg.member.id = :memberId ORDER BY mg.isFavorite DESC, mg.createdAt DESC")
    List<MemberGym> findByMemberIdWithGym(@Param("memberId") Long memberId);

    @Query("SELECT mg FROM MemberGym mg LEFT JOIN FETCH mg.gym WHERE mg.member.id = :memberId ORDER BY mg.isFavorite DESC, mg.createdAt DESC")
    List<MemberGym> findByMemberIdWithGymIncludeDeleted(@Param("memberId") Long memberId);

    @Query("SELECT COUNT(mg) FROM MemberGym mg WHERE mg.member.id = :memberId")
    int countByMemberId(@Param("memberId") Long memberId);

    boolean existsByMemberAndGym(Member member, Gym gym);

    void deleteByMemberAndGym(Member member, Gym gym);
}
