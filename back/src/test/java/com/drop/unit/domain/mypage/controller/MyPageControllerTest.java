package com.drop.unit.domain.mypage.controller;

import com.drop.domain.mypage.controller.MyPageController;
import com.drop.domain.mypage.dto.MyPageProfileDto;
import com.drop.domain.mypage.dto.NotificationSettingDto;
import com.drop.domain.mypage.dto.PasswordChangeRequestDto;
import com.drop.domain.mypage.dto.ProfileUpdateRequestDto;
import com.drop.domain.mypage.service.MyPageService;
import com.drop.global.security.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MyPageControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private MyPageService myPageService;

    @InjectMocks
    private MyPageController myPageController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(myPageController)
                .setCustomArgumentResolvers(new TestAuthResolver())
                .build();
    }

    static class TestAuthResolver implements HandlerMethodArgumentResolver {
        @Override
        public boolean supportsParameter(MethodParameter parameter) {
            return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
        }

        @Override
        public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                      NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
            return CustomUserDetails.of(1L, "test@email.com", "ROLE_MEMBER");
        }
    }

    @Test
    @DisplayName("내 프로필 조회")
    void getMyProfile() throws Exception {
        // given
        MyPageProfileDto dto = MyPageProfileDto.builder()
                .email("test@email.com")
                .username("testUser")
                .role("MEMBER")
                .build();

        when(myPageService.getMyProfile(1L, "ROLE_MEMBER")).thenReturn(dto);

        // when & then
        mockMvc.perform(get("/mypage/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("test@email.com"));
    }

    @Test
    @DisplayName("프로필 수정")
    void updateProfile() throws Exception {
        // given
        ProfileUpdateRequestDto dto = new ProfileUpdateRequestDto();
        dto.setUsername("newUsername");

        // when & then
        mockMvc.perform(patch("/mypage/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        verify(myPageService).updateProfile(eq(1L), any(ProfileUpdateRequestDto.class));
    }

    @Test
    @DisplayName("비밀번호 변경")
    void changePassword() throws Exception {
        // given
        PasswordChangeRequestDto dto = new PasswordChangeRequestDto();
        dto.setCurrentPassword("oldPassword");
        dto.setNewPassword("newPass1@");

        // when & then
        mockMvc.perform(patch("/mypage/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        verify(myPageService).changePassword(eq(1L), any(PasswordChangeRequestDto.class));
    }

    @Test
    @DisplayName("로그아웃")
    void logout() throws Exception {
        // when & then
        mockMvc.perform(post("/mypage/logout")
                        .header("Authorization", "Bearer testAccessToken"))
                .andExpect(status().isOk());

        verify(myPageService).logout(1L, "testAccessToken");
    }

    @Test
    @DisplayName("회원 탈퇴")
    void withdraw() throws Exception {
        // when & then
        mockMvc.perform(delete("/mypage/withdraw"))
                .andExpect(status().isOk());

        verify(myPageService).withdraw(1L);
    }

    @Test
    @DisplayName("알림 설정 변경")
    void updateNotificationSetting() throws Exception {
        // given
        NotificationSettingDto dto = new NotificationSettingDto();
        dto.setNotificationEnabled(false);

        // when & then
        mockMvc.perform(patch("/mypage/notification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        verify(myPageService).updateNotificationSetting(eq(1L), any(NotificationSettingDto.class));
    }

    @Test
    @DisplayName("프로필 사진 삭제")
    void deleteProfileImage() throws Exception {
        // when & then
        mockMvc.perform(delete("/mypage/profile-image"))
                .andExpect(status().isOk());

        verify(myPageService).deleteProfileImage(1L);
    }

    @Test
    @DisplayName("My Box 조회")
    void getHomeBox() throws Exception {
        // given
        when(myPageService.getHomeBoxId(1L)).thenReturn(5L);

        // when & then
        mockMvc.perform(get("/mypage/home-box"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(5));
    }

    @Test
    @DisplayName("My Box 설정")
    void setHomeBox() throws Exception {
        // when & then
        mockMvc.perform(patch("/mypage/home-box/5"))
                .andExpect(status().isOk());

        verify(myPageService).setHomeBox(1L, 5L);
    }

    @Test
    @DisplayName("My Box 해제")
    void clearHomeBox() throws Exception {
        // when & then
        mockMvc.perform(delete("/mypage/home-box"))
                .andExpect(status().isOk());

        verify(myPageService).setHomeBox(1L, null);
    }
}
