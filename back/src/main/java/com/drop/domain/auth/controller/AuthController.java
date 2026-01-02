package com.drop.domain.auth.controller;

import com.drop.domain.auth.dto.GoogleAuthDto;
import com.drop.domain.auth.dto.TokenDto;
import com.drop.domain.auth.dto.UserCreateDto;
import com.drop.domain.auth.service.GoogleAuthService;
import com.drop.domain.auth.service.UserDtoConverter;
import com.drop.domain.auth.service.UserService;
import com.drop.domain.crossfitbox.dto.CrossfitBoxCreateDto;
import com.drop.domain.crossfitbox.dto.CrossfitBoxDto;
import com.drop.domain.crossfitbox.service.CrossfitBoxService;
import com.drop.domain.member.dto.MemberCreateDto;
import com.drop.domain.member.dto.MemberDto;
import com.drop.domain.member.service.MemberService;
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
    private final CrossfitBoxService crossfitBoxService;
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

    @Operation(summary = "크로스핏박스(CrossfitBox) 가입", description = "크로스핏박스 전용 회원가입")
    @PostMapping("/sign-up/crossfit-box")
    public ResponseEntity<ResultResponse> signUpCrossfitBox(
            @RequestBody @Valid CrossfitBoxCreateDto crossfitBoxCreateDto
    ){
        crossfitBoxCreateDto.setPassword(passwordEncoder.encode(crossfitBoxCreateDto.getPassword()));
        crossfitBoxCreateDto.setRole(UserRole.GYM);

        CrossfitBoxDto savedCrossfitBox = crossfitBoxService.createCrossfitBox(crossfitBoxCreateDto);
        ResultResponse result = ResultResponse.of(ResultCode.REGISTER_SUCCESS, savedCrossfitBox);
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
