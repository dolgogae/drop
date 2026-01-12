package com.drop.unit.domain.dashboard.controller;

import com.drop.domain.dashboard.controller.DashboardController;
import com.drop.domain.dashboard.dto.DashboardSummaryDto;
import com.drop.domain.dashboard.service.DashboardService;
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
class DashboardControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DashboardService dashboardService;

    @InjectMocks
    private DashboardController dashboardController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(dashboardController).build();
    }

    @Test
    @DisplayName("대시보드 요약 조회 - 비로그인")
    void getDashboardSummary_anonymous() throws Exception {
        // given
        DashboardSummaryDto dto = DashboardSummaryDto.builder()
                .nearbyCrossfitBoxCount(10)
                .nearbyBasis(LocationMode.CURRENT)
                .myCrossfitBoxesPreview(List.of())
                .hasMoreMyCrossfitBoxes(false)
                .build();

        when(dashboardService.getDashboardSummary(any(), any(), any(), any())).thenReturn(dto);

        // when & then
        mockMvc.perform(get("/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nearbyCrossfitBoxCount").value(10));
    }

    @Test
    @DisplayName("대시보드 요약 조회 - 위치 정보 포함")
    void getDashboardSummary_withLocation() throws Exception {
        // given
        DashboardSummaryDto dto = DashboardSummaryDto.builder()
                .nearbyCrossfitBoxCount(5)
                .nearbyBasis(LocationMode.CURRENT)
                .myCrossfitBoxesPreview(List.of())
                .hasMoreMyCrossfitBoxes(false)
                .build();

        when(dashboardService.getDashboardSummary(any(), any(), any(), any())).thenReturn(dto);

        // when & then
        mockMvc.perform(get("/dashboard/summary")
                        .param("locationMode", "CURRENT")
                        .param("latGrid", "37.5")
                        .param("lngGrid", "127.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.nearbyCrossfitBoxCount").value(5));
    }
}
