package com.drop.unit.domain.auth.controller;

import com.drop.domain.auth.controller.AuthController;
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
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private UserService userService;

    @Mock
    private MemberService memberService;

    @Mock
    private CrossfitBoxService crossfitBoxService;

    @Mock
    private GoogleAuthService googleAuthService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserDtoConverter userDtoConverter;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    @DisplayName("일반 회원가입")
    void signUp() throws Exception {
        // given
        UserCreateDto dto = new UserCreateDto();
        dto.setEmail("test@email.com");
        dto.setPassword("password123");
        dto.setUsername("testUser");

        ResultResponse response = ResultResponse.of(ResultCode.REGISTER_SUCCESS, null);

        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userService.registerUser(any())).thenReturn(response);

        // when & then
        mockMvc.perform(post("/auth/sign-up")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("일반 회원(Member) 가입")
    void signUpMember() throws Exception {
        // given
        MemberCreateDto dto = new MemberCreateDto();
        dto.setEmail("member@email.com");
        dto.setPassword("password123");
        dto.setUsername("memberUser");

        MemberDto memberDto = MemberDto.builder()
                .id(1L)
                .email("member@email.com")
                .username("memberUser")
                .build();

        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(memberService.createMember(any())).thenReturn(memberDto);

        // when & then
        mockMvc.perform(post("/auth/sign-up/member")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("member@email.com"));
    }

    @Test
    @DisplayName("크로스핏박스 가입")
    void signUpCrossfitBox() throws Exception {
        // given
        CrossfitBoxCreateDto dto = new CrossfitBoxCreateDto();
        dto.setEmail("box@email.com");
        dto.setPassword("password123");
        dto.setName("Test Box");
        dto.setUsername("TestBoxUser");

        CrossfitBoxDto crossfitBoxDto = CrossfitBoxDto.builder()
                .id(1L)
                .email("box@email.com")
                .name("Test Box")
                .build();

        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(crossfitBoxService.createCrossfitBox(any())).thenReturn(crossfitBoxDto);

        // when & then
        mockMvc.perform(post("/auth/sign-up/crossfit-box")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Test Box"));
    }

    @Test
    @DisplayName("로그인 콜백")
    void loginCallback() throws Exception {
        // when & then
        mockMvc.perform(get("/auth/login/callback")
                        .param("accessToken", "testAccessToken")
                        .param("refreshToken", "testRefreshToken"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("testAccessToken"))
                .andExpect(jsonPath("$.data.refreshToken").value("testRefreshToken"));
    }

    @Test
    @DisplayName("Google 소셜 로그인")
    void googleAuth() throws Exception {
        // given
        GoogleAuthDto dto = new GoogleAuthDto();
        dto.setIdToken("googleIdToken");

        TokenDto tokenDto = TokenDto.builder()
                .accessToken("accessToken")
                .refreshToken("refreshToken")
                .build();

        when(googleAuthService.authenticateWithGoogle("googleIdToken")).thenReturn(tokenDto);

        // when & then
        mockMvc.perform(post("/auth/oauth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("accessToken"));
    }
}
