package com.drop.unit.domain.membercrossfitbox.controller;

import com.drop.domain.membercrossfitbox.controller.MemberCrossfitBoxController;
import com.drop.domain.membercrossfitbox.dto.MemberCrossfitBoxDto;
import com.drop.domain.membercrossfitbox.dto.MemberCrossfitBoxRequestDto;
import com.drop.domain.membercrossfitbox.service.MemberCrossfitBoxService;
import com.drop.global.security.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MemberCrossfitBoxControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private MemberCrossfitBoxService memberCrossfitBoxService;

    @InjectMocks
    private MemberCrossfitBoxController memberCrossfitBoxController;

    private CustomUserDetails userDetails;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(memberCrossfitBoxController)
                .setCustomArgumentResolvers(new TestAuthenticationPrincipalResolver())
                .build();
        userDetails = CustomUserDetails.of(1L, "test@email.com", "ROLE_MEMBER");
    }

    @Test
    @DisplayName("내 크로스핏박스 목록 조회")
    void getMyCrossfitBoxes() throws Exception {
        // given
        MemberCrossfitBoxDto dto = MemberCrossfitBoxDto.builder()
                .crossfitBoxId(1L)
                .name("Test Box")
                .isFavorite(true)
                .build();

        when(memberCrossfitBoxService.getMyCrossfitBoxes(1L)).thenReturn(List.of(dto));

        // when & then
        mockMvc.perform(get("/member-crossfit-box"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("Test Box"));
    }

    @Test
    @DisplayName("내 크로스핏박스에 추가")
    void addCrossfitBoxToMyList() throws Exception {
        // given
        MemberCrossfitBoxRequestDto request = new MemberCrossfitBoxRequestDto(1L, true);
        MemberCrossfitBoxDto responseDto = MemberCrossfitBoxDto.builder()
                .crossfitBoxId(1L)
                .name("Test Box")
                .isFavorite(true)
                .build();

        when(memberCrossfitBoxService.addCrossfitBoxToMyList(eq(1L), any())).thenReturn(responseDto);

        // when & then
        mockMvc.perform(post("/member-crossfit-box")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.crossfitBoxId").value(1));
    }

    @Test
    @DisplayName("즐겨찾기 토글")
    void toggleFavorite() throws Exception {
        // given
        MemberCrossfitBoxDto dto = MemberCrossfitBoxDto.builder()
                .crossfitBoxId(1L)
                .name("Test Box")
                .isFavorite(true)
                .build();

        when(memberCrossfitBoxService.toggleFavorite(1L, 1L)).thenReturn(dto);

        // when & then
        mockMvc.perform(patch("/member-crossfit-box/1/favorite"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isFavorite").value(true));
    }

    @Test
    @DisplayName("내 크로스핏박스에서 제거")
    void removeCrossfitBoxFromMyList() throws Exception {
        // when & then
        mockMvc.perform(delete("/member-crossfit-box/1"))
                .andExpect(status().isOk());

        verify(memberCrossfitBoxService).removeCrossfitBoxFromMyList(1L, 1L);
    }
}
