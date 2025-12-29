package com.drop.global.security;

import com.drop.domain.gym.repository.GymRepository;
import com.drop.domain.member.repository.MemberRepository;
import com.drop.global.enums.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Composite repository that queries both Member and Gym repositories.
 * Used for authentication where we need to find any user type by email.
 */
@Repository
@RequiredArgsConstructor
public class AuthenticatableRepository {
    private final MemberRepository memberRepository;
    private final GymRepository gymRepository;

    /**
     * Find any authenticatable entity by email.
     * Checks Member first, then Gym.
     */
    public Optional<Authenticatable> findByEmail(String email) {
        Optional<Authenticatable> member = memberRepository.findByEmail(email)
                .map(m -> (Authenticatable) m);
        if (member.isPresent()) {
            return member;
        }
        return gymRepository.findByEmail(email)
                .map(g -> (Authenticatable) g);
    }

    /**
     * Find authenticatable entity by ID and role.
     */
    public Optional<Authenticatable> findById(Long id, UserRole role) {
        return switch (role) {
            case MEMBER -> memberRepository.findById(id).map(m -> (Authenticatable) m);
            case GYM -> gymRepository.findById(id).map(g -> (Authenticatable) g);
            default -> Optional.empty();
        };
    }

    /**
     * Check if email exists in either Member or Gym.
     */
    public boolean existsByEmail(String email) {
        return memberRepository.existsByEmail(email) || gymRepository.existsByEmail(email);
    }
}
