package com.drop.unit.domain.mypage.service;

import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.repository.CrossfitBoxRepository;
import com.drop.domain.member.data.Member;
import com.drop.domain.member.repository.MemberRepository;
import com.drop.domain.mypage.dto.MyPageProfileDto;
import com.drop.domain.mypage.dto.NotificationSettingDto;
import com.drop.domain.mypage.dto.PasswordChangeRequestDto;
import com.drop.domain.mypage.dto.ProfileUpdateRequestDto;
import com.drop.domain.mypage.service.MyPageService;
import com.drop.global.code.error.exception.BusinessException;
import com.drop.global.enums.UserRole;
import com.drop.global.redis.RedisUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MyPageServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private CrossfitBoxRepository crossfitBoxRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RedisUtils redisUtils;

    @InjectMocks
    private MyPageService myPageService;

    private Member member;
    private CrossfitBox crossfitBox;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(myPageService, "uploadPath", "./test-uploads");

        member = Member.builder()
                .id(1L)
                .username("testUser")
                .email("test@email.com")
                .password("encodedPassword")
                .role(UserRole.MEMBER)
                .notificationEnabled(true)
                .build();

        crossfitBox = CrossfitBox.builder()
                .id(1L)
                .name("Test Box")
                .email("box@email.com")
                .role(UserRole.GYM)
                .build();
    }

    @Test
    @DisplayName("프로필 조회 - 회원")
    void getMyProfile_member() {
        // given
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        // when
        MyPageProfileDto result = myPageService.getMyProfile(1L, "ROLE_MEMBER");

        // then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@email.com");
        assertThat(result.getUsername()).isEqualTo("testUser");
        assertThat(result.getRole()).isEqualTo("MEMBER");
    }

    @Test
    @DisplayName("프로필 조회 - 크로스핏박스 (GYM)")
    void getMyProfile_gym() {
        // given
        when(crossfitBoxRepository.findById(1L)).thenReturn(Optional.of(crossfitBox));

        // when
        MyPageProfileDto result = myPageService.getMyProfile(1L, "ROLE_GYM");

        // then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("box@email.com");
        assertThat(result.getUsername()).isEqualTo("Test Box");
        assertThat(result.getRole()).isEqualTo("GYM");
    }

    @Test
    @DisplayName("프로필 조회 - 존재하지 않는 회원")
    void getMyProfile_memberNotFound() {
        // given
        when(memberRepository.findById(999L)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> myPageService.getMyProfile(999L, "ROLE_MEMBER"))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("프로필 업데이트 - 성공")
    void updateProfile_success() {
        // given
        ProfileUpdateRequestDto dto = new ProfileUpdateRequestDto();
        dto.setUsername("newUsername");

        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        // when
        myPageService.updateProfile(1L, dto);

        // then
        verify(memberRepository).findById(1L);
    }

    @Test
    @DisplayName("비밀번호 변경 - 성공")
    void changePassword_success() {
        // given
        PasswordChangeRequestDto dto = new PasswordChangeRequestDto();
        dto.setCurrentPassword("currentPassword");
        dto.setNewPassword("newPassword");

        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(passwordEncoder.matches("currentPassword", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("newEncodedPassword");

        // when
        myPageService.changePassword(1L, dto);

        // then
        verify(passwordEncoder).encode("newPassword");
    }

    @Test
    @DisplayName("비밀번호 변경 - 현재 비밀번호 불일치")
    void changePassword_wrongCurrentPassword() {
        // given
        PasswordChangeRequestDto dto = new PasswordChangeRequestDto();
        dto.setCurrentPassword("wrongPassword");
        dto.setNewPassword("newPassword");

        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        // when & then
        assertThatThrownBy(() -> myPageService.changePassword(1L, dto))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("로그아웃 - 성공")
    void logout_success() {
        // given
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        // when
        myPageService.logout(1L, "accessToken");

        // then
        verify(redisUtils).setData(eq("BL:accessToken"), eq("logout"), anyLong());
    }

    @Test
    @DisplayName("회원 탈퇴 - 성공")
    void withdraw_success() {
        // given
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        // when
        myPageService.withdraw(1L);

        // then
        verify(memberRepository).delete(member);
    }

    @Test
    @DisplayName("알림 설정 업데이트 - 성공")
    void updateNotificationSetting_success() {
        // given
        NotificationSettingDto dto = new NotificationSettingDto();
        dto.setNotificationEnabled(false);

        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        // when
        myPageService.updateNotificationSetting(1L, dto);

        // then
        verify(memberRepository).findById(1L);
    }

    @Test
    @DisplayName("홈박스 설정 - 성공")
    void setHomeBox_success() {
        // given
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(crossfitBoxRepository.findById(1L)).thenReturn(Optional.of(crossfitBox));

        // when
        myPageService.setHomeBox(1L, 1L);

        // then
        verify(memberRepository).findById(1L);
        verify(crossfitBoxRepository).findById(1L);
    }

    @Test
    @DisplayName("홈박스 설정 - null로 초기화")
    void setHomeBox_clear() {
        // given
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        // when
        myPageService.setHomeBox(1L, null);

        // then
        verify(memberRepository).findById(1L);
        verify(crossfitBoxRepository, never()).findById(any());
    }

    @Test
    @DisplayName("홈박스 ID 조회 - 있음")
    void getHomeBoxId_exists() {
        // given
        Member memberWithHomeBox = Member.builder()
                .id(1L)
                .username("testUser")
                .homeBox(crossfitBox)
                .build();

        when(memberRepository.findById(1L)).thenReturn(Optional.of(memberWithHomeBox));

        // when
        Long result = myPageService.getHomeBoxId(1L);

        // then
        assertThat(result).isEqualTo(1L);
    }

    @Test
    @DisplayName("홈박스 ID 조회 - 없음")
    void getHomeBoxId_notExists() {
        // given
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        // when
        Long result = myPageService.getHomeBoxId(1L);

        // then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("프로필 이미지 삭제 - 이미지 있음")
    void deleteProfileImage_withImage() {
        // given
        Member memberWithImage = Member.builder()
                .id(1L)
                .username("testUser")
                .profileImage("test-image.jpg")
                .build();

        when(memberRepository.findById(1L)).thenReturn(Optional.of(memberWithImage));

        // when
        myPageService.deleteProfileImage(1L);

        // then
        verify(memberRepository).findById(1L);
    }

    @Test
    @DisplayName("프로필 이미지 삭제 - 이미지 없음")
    void deleteProfileImage_withoutImage() {
        // given
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        // when
        myPageService.deleteProfileImage(1L);

        // then
        verify(memberRepository).findById(1L);
    }
}
