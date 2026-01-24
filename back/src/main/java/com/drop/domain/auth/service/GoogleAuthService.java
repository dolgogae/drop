package com.drop.domain.auth.service;

import com.drop.domain.auth.dto.GoogleUserInfo;
import com.drop.domain.auth.dto.TokenDto;
import com.drop.domain.member.data.Member;
import com.drop.domain.member.dto.MemberDto;
import com.drop.domain.member.mapper.MemberMapper;
import com.drop.domain.member.repository.MemberRepository;
import com.drop.global.code.error.ErrorCode;
import com.drop.global.code.error.exception.BusinessException;
import com.drop.global.enums.UserRole;
import com.drop.global.security.AuthenticatableRepository;
import com.drop.global.security.CustomUserDetails;
import com.drop.global.security.jwt.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleAuthService {
    private final MemberRepository memberRepository;
    private final MemberMapper memberMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper;
    private final AuthenticatableRepository authenticatableRepository;

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Transactional
    public TokenDto authenticateWithGoogle(String idToken) {
        GoogleUserInfo userInfo = verifyAndExtractUserInfo(idToken);

        if (authenticatableRepository.existsByEmail(userInfo.getEmail())) {
            Optional<Member> existingMember = memberRepository.findByEmail(userInfo.getEmail());
            if (existingMember.isEmpty()) {
                throw new BusinessException(ErrorCode.USER_EMAIL_ALREADY_EXISTS);
            }
        }

        Optional<Member> existingMember = memberRepository.findByEmail(userInfo.getEmail());

        Member member;
        if (existingMember.isPresent()) {
            member = existingMember.get();
            log.info("Existing member logged in via Google: {}", userInfo.getEmail());
        } else {
            member = createMemberFromGoogle(userInfo);
            log.info("New member created via Google: {}", userInfo.getEmail());
        }

        CustomUserDetails customUserDetails = CustomUserDetails.of(
                member.getEmail(),
                member.getRole().getKey()
        );

        com.drop.global.security.jwt.TokenDto jwtTokenDto = jwtTokenProvider.generateTokenDto(customUserDetails);

        member.setTokens(jwtTokenDto.getAccessToken(), jwtTokenDto.getRefreshToken());
        memberRepository.save(member);

        return TokenDto.builder()
                .accessToken(jwtTokenDto.getAccessToken())
                .refreshToken(jwtTokenDto.getRefreshToken())
                .build();
    }

    private GoogleUserInfo verifyAndExtractUserInfo(String idToken) {
        try {
            String[] parts = idToken.split("\\.");
            if (parts.length != 3) {
                throw new BusinessException("Invalid ID token format", ErrorCode.INVALID_INPUT_VALUE);
            }

            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            Map<String, Object> claims = objectMapper.readValue(payload, Map.class);

            String aud = (String) claims.get("aud");
            if (!googleClientId.equals(aud)) {
                log.warn("Token audience mismatch: expected={}, actual={}", googleClientId, aud);
            }

            return GoogleUserInfo.builder()
                    .sub((String) claims.get("sub"))
                    .email((String) claims.get("email"))
                    .emailVerified((Boolean) claims.get("email_verified"))
                    .name((String) claims.get("name"))
                    .picture((String) claims.get("picture"))
                    .givenName((String) claims.get("given_name"))
                    .familyName((String) claims.get("family_name"))
                    .build();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to verify Google ID token", e);
            throw new BusinessException("Invalid Google ID token", ErrorCode.INVALID_INPUT_VALUE);
        }
    }

    private Member createMemberFromGoogle(GoogleUserInfo userInfo) {
        Member member = Member.builder()
                .email(userInfo.getEmail())
                .username(userInfo.getName())
                .password(UUID.randomUUID().toString())
                .role(UserRole.MEMBER)
                .build();

        return memberRepository.save(member);
    }

    public MemberDto getMemberInfo(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_EXIST));
        return memberMapper.toDto(member);
    }
}
