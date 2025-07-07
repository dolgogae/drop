package com.drop.domain.user.member.repository;

import com.drop.domain.user.member.data.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
}
