package com.drop.domain.auth.service;

import com.drop.domain.auth.dto.UserCreateDto;
import com.drop.domain.auth.dto.UserDto;
import com.drop.domain.gym.data.Gym;
import com.drop.domain.gym.dto.GymCreateDto;
import com.drop.domain.gym.dto.GymDto;
import com.drop.domain.gym.repository.GymRepository;
import com.drop.domain.gym.service.GymService;
import com.drop.domain.member.data.Member;
import com.drop.domain.member.dto.MemberCreateDto;
import com.drop.domain.member.dto.MemberDto;
import com.drop.domain.member.repository.MemberRepository;
import com.drop.domain.member.service.MemberService;
import com.drop.global.code.error.ErrorCode;
import com.drop.global.code.error.exception.BusinessException;
import com.drop.global.code.result.ResultCode;
import com.drop.global.code.result.ResultResponse;
import com.drop.global.enums.UserRole;
import com.drop.global.security.Authenticatable;
import com.drop.global.security.AuthenticatableRepository;
import com.drop.global.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserDtoConverter userDtoConverter;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticatableRepository authenticatableRepository;
    private final MemberRepository memberRepository;
    private final GymRepository gymRepository;
    private final MemberService memberService;
    private final GymService gymService;

    @Transactional
    public UserDto findUserAndUpdateTokens(Long id, UserRole role, String accessToken, String refreshToken) {
        Authenticatable user = authenticatableRepository.findById(id, role).orElseThrow(() ->
                new BusinessException(ErrorCode.USER_NOT_EXIST));
        user.setTokens(accessToken, refreshToken);

        // Save to the correct repository based on role
        if (role == UserRole.MEMBER) {
            memberRepository.save((Member) user);
        } else if (role == UserRole.GYM) {
            gymRepository.save((Gym) user);
        }

        return mapToUserDto(user);
    }

    public ResultResponse registerUser(UserCreateDto userCreateDto) {
        UserRole role = userCreateDto.getRole();
        if (role == null) {
            throw new BusinessException(ErrorCode.USER_ROLE_DOES_NOT_EXISTS);
        }

        // Check if email already exists
        if (authenticatableRepository.existsByEmail(userCreateDto.getEmail())) {
            throw new BusinessException(ErrorCode.USER_EMAIL_ALREADY_EXISTS);
        }

        switch (role) {
            case MEMBER -> {
                MemberCreateDto memberCreateDto = userDtoConverter.toMemberDto(userCreateDto);
                MemberDto savedMember = memberService.createMember(memberCreateDto);
                return ResultResponse.of(ResultCode.REGISTER_SUCCESS, savedMember);
            }
            case GYM -> {
                GymCreateDto gymCreateDto = userDtoConverter.toGymDto(userCreateDto);
                GymDto savedGym = gymService.createGym(gymCreateDto);
                return ResultResponse.of(ResultCode.REGISTER_SUCCESS, savedGym);
            }
            default -> throw new BusinessException(ErrorCode.USER_ROLE_DOES_NOT_EXISTS);
        }
    }

    public Long getUserId(String token) {
        String email = jwtTokenProvider.getUserEmail(token);
        Authenticatable user = authenticatableRepository.findByEmail(email).orElseThrow(() ->
                new BusinessException(ErrorCode.USER_NOT_EXIST));
        return user.getId();
    }

    private UserDto mapToUserDto(Authenticatable user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }
}
