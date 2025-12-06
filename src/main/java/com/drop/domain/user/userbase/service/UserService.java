package com.drop.domain.user.userbase.service;

import com.drop.domain.user.gym.dto.GymCreateDto;
import com.drop.domain.user.gym.dto.GymDto;
import com.drop.domain.user.gym.service.GymService;
import com.drop.domain.user.member.dto.MemberCreateDto;
import com.drop.domain.user.member.dto.MemberDto;
import com.drop.domain.user.member.service.MemberService;
import com.drop.domain.user.trainer.dto.TrainerCreateDto;
import com.drop.domain.user.trainer.dto.TrainerDto;
import com.drop.domain.user.trainer.service.TrainerService;
import com.drop.domain.user.userbase.mapper.UserMapper;
import com.drop.global.enums.UserRole;
import com.drop.domain.user.userbase.data.UserBase;
import com.drop.domain.user.userbase.dto.UserCreateDto;
import com.drop.domain.user.userbase.dto.UserDto;
import com.drop.domain.user.userbase.repository.UserJpaRepository;
import com.drop.global.code.error.ErrorCode;
import com.drop.global.code.error.exception.BusinessException;
import com.drop.global.code.result.ResultCode;
import com.drop.global.code.result.ResultResponse;
import com.drop.global.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserMapper userMapper;
    private final UserDtoConverter userDtoConverter;
    private final JwtTokenProvider jwtTokenProvider;

    private final UserJpaRepository userJpaRepository;

    private final TrainerService trainerService;
    private final MemberService memberService;
    private final GymService gymService;

    public UserDto findUserAndUpdateTokens(Long id, String accessToken, String refreshToken) {
        UserBase user = userJpaRepository.findById(id).orElseThrow(() ->
                new BusinessException(ErrorCode.USER_NOT_EXIST));
        user.setTokens(accessToken, refreshToken);

        UserBase savedUser = userJpaRepository.save(user);

        return userMapper.toDto(savedUser);
    }

    public ResultResponse registerUser(UserCreateDto userCreateDto) {
        UserRole role = userCreateDto.getRole();
        if (role == null) {
            throw new BusinessException(ErrorCode.USER_ROLE_DOES_NOT_EXISTS);
        }

        switch (role) {
            case TRAINER -> {
                TrainerCreateDto trainerCreateDto = userDtoConverter.toTrainerDto(userCreateDto);
                TrainerDto savedTrainer = trainerService.creatTrainer(trainerCreateDto);
                return ResultResponse.of(ResultCode.REGISTER_SUCCESS, savedTrainer);
            }
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

    public Long getUserId(String token){
        String email = jwtTokenProvider.getUserEmail(token);
        UserBase userBase = userJpaRepository.findByEmail(email).orElseThrow(() ->
                new BusinessException(ErrorCode.USER_NOT_EXIST));
        return userBase.getId();
    }
}
