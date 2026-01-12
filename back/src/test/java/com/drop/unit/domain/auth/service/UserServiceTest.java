package com.drop.unit.domain.auth.service;

import com.drop.domain.auth.dto.UserCreateDto;
import com.drop.domain.auth.dto.UserDto;
import com.drop.domain.auth.service.UserDtoConverter;
import com.drop.domain.auth.service.UserService;
import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.dto.CrossfitBoxCreateDto;
import com.drop.domain.crossfitbox.dto.CrossfitBoxDto;
import com.drop.domain.crossfitbox.repository.CrossfitBoxRepository;
import com.drop.domain.crossfitbox.service.CrossfitBoxService;
import com.drop.domain.member.data.Member;
import com.drop.domain.member.dto.MemberCreateDto;
import com.drop.domain.member.dto.MemberDto;
import com.drop.domain.member.repository.MemberRepository;
import com.drop.domain.member.service.MemberService;
import com.drop.global.code.error.exception.BusinessException;
import com.drop.global.code.result.ResultResponse;
import com.drop.global.enums.UserRole;
import com.drop.global.security.AuthenticatableRepository;
import com.drop.global.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserDtoConverter userDtoConverter;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticatableRepository authenticatableRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private CrossfitBoxRepository crossfitBoxRepository;

    @Mock
    private MemberService memberService;

    @Mock
    private CrossfitBoxService crossfitBoxService;

    @InjectMocks
    private UserService userService;

    private Member member;
    private CrossfitBox crossfitBox;

    @BeforeEach
    void setUp() {
        member = Member.builder()
                .id(1L)
                .username("testUser")
                .email("test@email.com")
                .role(UserRole.MEMBER)
                .build();

        crossfitBox = CrossfitBox.builder()
                .id(1L)
                .name("Test Box")
                .email("box@email.com")
                .role(UserRole.GYM)
                .build();
    }

    @Test
    @DisplayName("사용자 조회 및 토큰 업데이트 - Member")
    void findUserAndUpdateTokens_member() {
        // given
        when(authenticatableRepository.findById(1L, UserRole.MEMBER))
                .thenReturn(Optional.of(member));

        // when
        UserDto result = userService.findUserAndUpdateTokens(1L, UserRole.MEMBER, "accessToken", "refreshToken");

        // then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@email.com");
        verify(memberRepository).save(any(Member.class));
    }

    @Test
    @DisplayName("사용자 조회 및 토큰 업데이트 - GYM")
    void findUserAndUpdateTokens_gym() {
        // given
        when(authenticatableRepository.findById(1L, UserRole.GYM))
                .thenReturn(Optional.of(crossfitBox));

        // when
        UserDto result = userService.findUserAndUpdateTokens(1L, UserRole.GYM, "accessToken", "refreshToken");

        // then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("box@email.com");
        verify(crossfitBoxRepository).save(any(CrossfitBox.class));
    }

    @Test
    @DisplayName("사용자 조회 및 토큰 업데이트 - 사용자 없음")
    void findUserAndUpdateTokens_userNotFound() {
        // given
        when(authenticatableRepository.findById(999L, UserRole.MEMBER))
                .thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() ->
                userService.findUserAndUpdateTokens(999L, UserRole.MEMBER, "accessToken", "refreshToken"))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("회원 등록 - Member 타입")
    void registerUser_member() {
        // given
        UserCreateDto createDto = new UserCreateDto();
        createDto.setUsername("newUser");
        createDto.setEmail("new@email.com");
        createDto.setPassword("password");
        createDto.setRole(UserRole.MEMBER);

        MemberCreateDto memberCreateDto = MemberCreateDto.builder()
                .username("newUser")
                .email("new@email.com")
                .password("password")
                .role(UserRole.MEMBER)
                .build();

        MemberDto memberDto = MemberDto.builder()
                .username("newUser")
                .email("new@email.com")
                .role(UserRole.MEMBER)
                .build();

        when(authenticatableRepository.existsByEmail("new@email.com")).thenReturn(false);
        when(userDtoConverter.toMemberDto(createDto)).thenReturn(memberCreateDto);
        when(memberService.createMember(any(MemberCreateDto.class))).thenReturn(memberDto);

        // when
        ResultResponse result = userService.registerUser(createDto);

        // then
        assertThat(result).isNotNull();
        verify(memberService).createMember(any(MemberCreateDto.class));
    }

    @Test
    @DisplayName("회원 등록 - GYM 타입")
    void registerUser_gym() {
        // given
        UserCreateDto createDto = new UserCreateDto();
        createDto.setUsername("newBox");
        createDto.setEmail("box@email.com");
        createDto.setPassword("password");
        createDto.setRole(UserRole.GYM);

        CrossfitBoxCreateDto boxCreateDto = CrossfitBoxCreateDto.builder()
                .username("newBox")
                .email("box@email.com")
                .password("password")
                .role(UserRole.GYM)
                .build();

        CrossfitBoxDto boxDto = CrossfitBoxDto.builder()
                .username("newBox")
                .email("box@email.com")
                .role(UserRole.GYM)
                .build();

        when(authenticatableRepository.existsByEmail("box@email.com")).thenReturn(false);
        when(userDtoConverter.toCrossfitBoxDto(createDto)).thenReturn(boxCreateDto);
        when(crossfitBoxService.createCrossfitBox(any(CrossfitBoxCreateDto.class))).thenReturn(boxDto);

        // when
        ResultResponse result = userService.registerUser(createDto);

        // then
        assertThat(result).isNotNull();
        verify(crossfitBoxService).createCrossfitBox(any(CrossfitBoxCreateDto.class));
    }

    @Test
    @DisplayName("회원 등록 - Role 없음")
    void registerUser_noRole() {
        // given
        UserCreateDto createDto = new UserCreateDto();
        createDto.setEmail("new@email.com");
        createDto.setPassword("password");
        createDto.setRole(null);

        // when & then
        assertThatThrownBy(() -> userService.registerUser(createDto))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("회원 등록 - 이메일 중복")
    void registerUser_emailExists() {
        // given
        UserCreateDto createDto = new UserCreateDto();
        createDto.setEmail("existing@email.com");
        createDto.setPassword("password");
        createDto.setRole(UserRole.MEMBER);

        when(authenticatableRepository.existsByEmail("existing@email.com")).thenReturn(true);

        // when & then
        assertThatThrownBy(() -> userService.registerUser(createDto))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("토큰에서 사용자 ID 조회")
    void getUserId_success() {
        // given
        when(jwtTokenProvider.getUserEmail("token")).thenReturn("test@email.com");
        when(authenticatableRepository.findByEmail("test@email.com")).thenReturn(Optional.of(member));

        // when
        Long result = userService.getUserId("token");

        // then
        assertThat(result).isEqualTo(1L);
    }

    @Test
    @DisplayName("토큰에서 사용자 ID 조회 - 사용자 없음")
    void getUserId_userNotFound() {
        // given
        when(jwtTokenProvider.getUserEmail("token")).thenReturn("notexist@email.com");
        when(authenticatableRepository.findByEmail("notexist@email.com")).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> userService.getUserId("token"))
                .isInstanceOf(BusinessException.class);
    }
}
