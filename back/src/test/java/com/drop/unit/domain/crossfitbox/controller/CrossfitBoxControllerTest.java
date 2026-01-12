package com.drop.unit.domain.crossfitbox.controller;

import com.drop.domain.crossfitbox.controller.CrossfitBoxController;
import com.drop.domain.crossfitbox.dto.CrossfitBoxDto;
import com.drop.domain.crossfitbox.service.CrossfitBoxService;
import com.drop.domain.schedule.dto.ScheduleListDto;
import com.drop.domain.schedule.service.ScheduleService;
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
class CrossfitBoxControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CrossfitBoxService crossfitBoxService;

    @Mock
    private ScheduleService scheduleService;

    @InjectMocks
    private CrossfitBoxController crossfitBoxController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(crossfitBoxController).build();
    }

    @Test
    @DisplayName("크로스핏박스 이름 검색")
    void searchCrossfitBoxes() throws Exception {
        // given
        CrossfitBoxDto dto = CrossfitBoxDto.builder()
                .id(1L)
                .name("Test Box")
                .email("test@email.com")
                .build();

        when(crossfitBoxService.searchByName("Test")).thenReturn(List.of(dto));

        // when & then
        mockMvc.perform(get("/crossfit-boxes/search")
                        .param("keyword", "Test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("Test Box"));
    }

    @Test
    @DisplayName("전체 크로스핏박스 목록 조회 (지도용)")
    void getAllCrossfitBoxesForMap() throws Exception {
        // given
        CrossfitBoxDto dto = CrossfitBoxDto.builder()
                .id(1L)
                .name("Test Box")
                .latitude(37.5)
                .longitude(127.0)
                .build();

        when(crossfitBoxService.getAllCrossfitBoxesWithLocation()).thenReturn(List.of(dto));

        // when & then
        mockMvc.perform(get("/crossfit-boxes/map"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].latitude").value(37.5));
    }

    @Test
    @DisplayName("영역 내 크로스핏박스 목록 조회")
    void getCrossfitBoxesByBounds() throws Exception {
        // given
        CrossfitBoxDto dto = CrossfitBoxDto.builder()
                .id(1L)
                .name("Test Box")
                .build();

        when(crossfitBoxService.getCrossfitBoxesByBounds(any(), any(), any(), any()))
                .thenReturn(List.of(dto));

        // when & then
        mockMvc.perform(get("/crossfit-boxes/map/bounds")
                        .param("swLat", "37.0")
                        .param("swLng", "126.0")
                        .param("neLat", "38.0")
                        .param("neLng", "128.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("크로스핏박스 상세 조회")
    void getCrossfitBoxById() throws Exception {
        // given
        CrossfitBoxDto dto = CrossfitBoxDto.builder()
                .id(1L)
                .name("Test Box")
                .email("test@email.com")
                .build();

        when(crossfitBoxService.getCrossfitBoxById(1L)).thenReturn(dto);

        // when & then
        mockMvc.perform(get("/crossfit-boxes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Test Box"));
    }

    @Test
    @DisplayName("크로스핏박스 시간표 조회")
    void getCrossfitBoxSchedule() throws Exception {
        // given
        ScheduleListDto dto = ScheduleListDto.builder()
                .crossfitBoxId(1L)
                .schedules(List.of())
                .build();

        when(scheduleService.getSchedule(1L)).thenReturn(dto);

        // when & then
        mockMvc.perform(get("/crossfit-boxes/1/schedule"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.crossfitBoxId").value(1));
    }
}
