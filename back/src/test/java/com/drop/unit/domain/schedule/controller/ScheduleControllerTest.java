package com.drop.unit.domain.schedule.controller;

import com.drop.domain.schedule.controller.ScheduleController;
import com.drop.domain.schedule.dto.ScheduleDto;
import com.drop.domain.schedule.dto.ScheduleListDto;
import com.drop.domain.schedule.dto.ScheduleUpdateDto;
import com.drop.domain.schedule.service.ScheduleService;
import com.drop.global.enums.DayOfWeek;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ScheduleControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private ScheduleService scheduleService;

    @InjectMocks
    private ScheduleController scheduleController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(scheduleController)
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
            return CustomUserDetails.of(1L, "gym@email.com", "ROLE_GYM");
        }
    }

    @Test
    @DisplayName("내 Box 시간표 조회")
    void getMySchedule() throws Exception {
        // given
        ScheduleListDto dto = ScheduleListDto.builder()
                .crossfitBoxId(1L)
                .schedules(List.of())
                .build();

        when(scheduleService.getSchedule(1L)).thenReturn(dto);

        // when & then
        mockMvc.perform(get("/schedule/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.crossfitBoxId").value(1));
    }

    @Test
    @DisplayName("시간표 전체 업데이트")
    void updateSchedule() throws Exception {
        // given
        ScheduleDto scheduleDto = ScheduleDto.builder()
                .dayOfWeek(DayOfWeek.MONDAY)
                .timeSlots(List.of())
                .build();

        ScheduleListDto responseDto = ScheduleListDto.builder()
                .crossfitBoxId(1L)
                .schedules(List.of(scheduleDto))
                .build();

        when(scheduleService.updateSchedule(eq(1L), any())).thenReturn(responseDto);

        // when & then
        mockMvc.perform(put("/schedule/my")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(scheduleDto))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.crossfitBoxId").value(1));
    }

    @Test
    @DisplayName("특정 요일들 일괄 업데이트")
    void updateScheduleForDays() throws Exception {
        // given
        ScheduleUpdateDto updateDto = ScheduleUpdateDto.builder()
                .targetDays(List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY))
                .timeSlots(List.of())
                .build();

        ScheduleListDto responseDto = ScheduleListDto.builder()
                .crossfitBoxId(1L)
                .schedules(List.of())
                .build();

        when(scheduleService.updateScheduleForDays(eq(1L), any())).thenReturn(responseDto);

        // when & then
        mockMvc.perform(put("/schedule/my/days")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.crossfitBoxId").value(1));
    }
}
