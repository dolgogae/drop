package com.drop.global.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomAuthenticationProvider implements AuthenticationProvider {
    private final PasswordEncoder passwordEncoder;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        if(authentication == null){
            log.info("Authentication is null");
            throw new InternalAuthenticationServiceException("Authentication is null");
        }
        String username = authentication.getName();
        if(authentication.getCredentials() == null){
            log.info("Credentials is null");
            throw new AuthenticationCredentialsNotFoundException("Credentials is null");
        }
        String password = authentication.getCredentials().toString();
        UserDetails loadedUser = customUserDetailsService.loadUserByUsername(username);
        if(loadedUser == null){
            log.info("UserDetailsService returned null, which is an interface contract violation");
            throw new InternalAuthenticationServiceException("UserDetailsService returned null, which is an interface contract violation");
        }
        if(!loadedUser.isAccountNonLocked()){
            log.info("User account is locked");
            throw new LockedException("User account is locked");
        }
        if(!loadedUser.isEnabled()){
            log.info("User is disabled");
            throw new DisabledException("User is disabled");
        }
        if(!loadedUser.isAccountNonExpired()){
            log.info("User account has expired");
            throw new AccountExpiredException("User account has expired");
        }
        if(!passwordEncoder.matches(password, loadedUser.getPassword())){
            log.info("Password does not match stored value");
            throw new BadCredentialsException("Password does not match stored value");
        }
        if(!loadedUser.isCredentialsNonExpired()){
            log.info("User credentials have expired");
            throw new CredentialsExpiredException("User credentials have expired");
        }
        UsernamePasswordAuthenticationToken result = new UsernamePasswordAuthenticationToken(loadedUser, null, loadedUser.getAuthorities());
        result.setDetails(authentication.getDetails());
        return result;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }

}
