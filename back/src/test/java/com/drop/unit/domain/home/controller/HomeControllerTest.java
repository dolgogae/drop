package com.drop.unit.domain.home.controller;

import com.drop.domain.home.controller.HomeController;
import com.drop.domain.home.dto.HomeSummaryDto;
import com.drop.domain.home.service.HomeService;
import com.drop.global.enums.LocationMode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class HomeControllerTest {

    private MockMvc mockMvc;

    @Mock
    private HomeService homeService;

    @InjectMocks
    private HomeController homeController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(homeController).build();
    }

    @Test
    @DisplayName("홈 요약 조회 - 비로그인")
    void getHomeSummary_anonymous() throws Exception {
        // given
        HomeSummaryDto dto = HomeSummaryDto.builder()
                .nearbyCrossfitBoxCount(10)
                .nearbyBasis(LocationMode.CURRENT)
                .myCrossfitBoxesPreview(List.of())
                .hasMoreMyCrossfitBoxes(false)
                .build();

        when(homeService.getHomeSummary(any(), any(), any(), any())).thenReturn(dto);

        // when & then
        mockMvc.perform(get("/home/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nearbyCrossfitBoxCount").value(10));
    }

    @Test
    @DisplayName("홈 요약 조회 - 위치 정보 포함")
    void getHomeSummary_withLocation() throws Exception {
        // given
        HomeSummaryDto dto = HomeSummaryDto.builder()
                .nearbyCrossfitBoxCount(5)
                .nearbyBasis(LocationMode.CURRENT)
                .myCrossfitBoxesPreview(List.of())
                .hasMoreMyCrossfitBoxes(false)
                .build();

        when(homeService.getHomeSummary(any(), any(), any(), any())).thenReturn(dto);

        // when & then
        mockMvc.perform(get("/home/summary")
                        .param("locationMode", "CURRENT")
                        .param("latGrid", "37.5")
                        .param("lngGrid", "127.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nearbyCrossfitBoxCount").value(5));
    }
}
