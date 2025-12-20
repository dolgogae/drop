package com.drop.domain.user.userbase.controller;

import com.drop.domain.user.gym.dto.GymCreateDto;
import com.drop.domain.user.gym.dto.GymDto;
import com.drop.domain.user.gym.service.GymService;
import com.drop.domain.user.member.dto.MemberCreateDto;
import com.drop.domain.user.member.dto.MemberDto;
import com.drop.domain.user.member.service.MemberService;
import com.drop.domain.user.userbase.dto.GoogleAuthDto;
import com.drop.domain.user.userbase.dto.TokenDto;
import com.drop.domain.user.userbase.dto.UserCreateDto;
import com.drop.domain.user.userbase.service.GoogleAuthService;
import com.drop.domain.user.userbase.service.UserDtoConverter;
import com.drop.domain.user.userbase.service.UserService;
import com.drop.global.code.result.ResultCode;
import com.drop.global.code.result.ResultResponse;
import com.drop.global.enums.UserRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
@Tag(name = "Auth", description = "인증 API")
public class AuthController {
    private final UserService userService;
    private final MemberService memberService;
    private final GymService gymService;
    private final GoogleAuthService googleAuthService;

    private final PasswordEncoder passwordEncoder;
    private final UserDtoConverter userDtoConverter;

    @Operation(summary = "일반 회원가입", description = "기본 정보만으로 회원가입 (레거시)")
    @PostMapping("/sign-up")
    public ResponseEntity<ResultResponse> signUp(
            @RequestBody @Valid UserCreateDto userCreateDto
    ){
        userCreateDto.setPassword(passwordEncoder.encode(userCreateDto.getPassword()));

        ResultResponse result = userService.registerUser(userCreateDto);
        return new ResponseEntity<>(result, HttpStatus.valueOf(result.getStatus()));
    }

    @Operation(summary = "일반 회원(Member) 가입", description = "일반 회원 전용 회원가입")
    @PostMapping("/sign-up/member")
    public ResponseEntity<ResultResponse> signUpMember(
            @RequestBody @Valid MemberCreateDto memberCreateDto
    ){
        memberCreateDto.setPassword(passwordEncoder.encode(memberCreateDto.getPassword()));
        memberCreateDto.setRole(UserRole.MEMBER);

        MemberDto savedMember = memberService.createMember(memberCreateDto);
        ResultResponse result = ResultResponse.of(ResultCode.REGISTER_SUCCESS, savedMember);
        return new ResponseEntity<>(result, HttpStatus.valueOf(result.getStatus()));
    }

    @Operation(summary = "체육관(Gym) 가입", description = "체육관 전용 회원가입")
    @PostMapping("/sign-up/gym")
    public ResponseEntity<ResultResponse> signUpGym(
            @RequestBody @Valid GymCreateDto gymCreateDto
    ){
        gymCreateDto.setPassword(passwordEncoder.encode(gymCreateDto.getPassword()));
        gymCreateDto.setRole(UserRole.GYM);

        GymDto savedGym = gymService.createGym(gymCreateDto);
        ResultResponse result = ResultResponse.of(ResultCode.REGISTER_SUCCESS, savedGym);
        return new ResponseEntity<>(result, HttpStatus.valueOf(result.getStatus()));
    }

    @Operation(summary = "JWT 로그인 성공 콜백 함수", description = "JWT 로그인 이후 성공 콜백 함수")
    @GetMapping("/login/callback")
    public ResponseEntity<ResultResponse> loginCallback(
            @RequestParam @NotBlank String accessToken, @RequestParam @NotBlank String refreshToken
    ){
        log.info("accessToken = {} refreshToken={}", accessToken, refreshToken);

        TokenDto tokenDto = TokenDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();

        ResultResponse result = ResultResponse.of(ResultCode.LOGIN_SUCCESS, tokenDto);
        return new ResponseEntity<>(result, HttpStatus.valueOf(result.getStatus()));
    }

    @Operation(summary = "Google 소셜 로그인", description = "Google ID Token으로 로그인/회원가입")
    @PostMapping("/oauth/google")
    public ResponseEntity<ResultResponse> googleAuth(
            @RequestBody @Valid GoogleAuthDto googleAuthDto
    ){
        log.info("Google OAuth request received");

        TokenDto tokenDto = googleAuthService.authenticateWithGoogle(googleAuthDto.getIdToken());
        ResultResponse result = ResultResponse.of(ResultCode.LOGIN_SUCCESS, tokenDto);
        return new ResponseEntity<>(result, HttpStatus.valueOf(result.getStatus()));
    }
}
