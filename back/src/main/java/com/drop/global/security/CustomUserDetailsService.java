package com.drop.global.security;

import com.drop.domain.user.userbase.data.UserBase;
import com.drop.domain.user.userbase.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserJpaRepository userJpaRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.info("loadUserByUsername called with email: {}", email);

        UserBase user = userJpaRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found with email: {}", email);
                    return new UsernameNotFoundException("존재하지 않는 아이디입니다.");
                });

        UserDetails userDetails = createUserDetails(user);
        log.info(userDetails.toString());
        return userDetails;
    }

    private UserDetails createUserDetails(UserBase user) {
        return CustomUserDetails.of(user);
    }
}