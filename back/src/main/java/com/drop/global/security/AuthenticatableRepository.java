package com.drop.global.security;

import com.drop.domain.crossfitbox.repository.CrossfitBoxRepository;
import com.drop.domain.member.repository.MemberRepository;
import com.drop.global.enums.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Composite repository that queries both Member and CrossfitBox repositories.
 * Used for authentication where we need to find any user type by email.
 */
@Repository
@RequiredArgsConstructor
public class AuthenticatableRepository {
    private final MemberRepository memberRepository;
    private final CrossfitBoxRepository crossfitBoxRepository;

    /**
     * Find any authenticatable entity by email.
     * Checks Member first, then CrossfitBox.
     */
    public Optional<Authenticatable> findByEmail(String email) {
        Optional<Authenticatable> member = memberRepository.findByEmail(email)
                .map(m -> (Authenticatable) m);
        if (member.isPresent()) {
            return member;
        }
        return crossfitBoxRepository.findByEmail(email)
                .map(c -> (Authenticatable) c);
    }

    /**
     * Find authenticatable entity by ID and role.
     */
    public Optional<Authenticatable> findById(Long id, UserRole role) {
        return switch (role) {
            case MEMBER -> memberRepository.findById(id).map(m -> (Authenticatable) m);
            case GYM -> crossfitBoxRepository.findById(id).map(c -> (Authenticatable) c);
            default -> Optional.empty();
        };
    }

    /**
     * Check if email exists in either Member or CrossfitBox.
     */
    public boolean existsByEmail(String email) {
        return memberRepository.existsByEmail(email) || crossfitBoxRepository.existsByEmail(email);
    }
}
