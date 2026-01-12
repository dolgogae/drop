package com.drop.unit.domain.schedule.service;

import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.repository.CrossfitBoxRepository;
import com.drop.domain.schedule.data.CrossfitBoxSchedule;
import com.drop.domain.schedule.dto.ScheduleDto;
import com.drop.domain.schedule.dto.ScheduleListDto;
import com.drop.domain.schedule.dto.ScheduleUpdateDto;
import com.drop.domain.schedule.dto.TimeSlotDto;
import com.drop.domain.schedule.mapper.ScheduleMapper;
import com.drop.domain.schedule.repository.CrossfitBoxScheduleRepository;
import com.drop.domain.schedule.service.ScheduleService;
import com.drop.global.enums.DayOfWeek;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceTest {

    @Mock
    private CrossfitBoxScheduleRepository scheduleRepository;

    @Mock
    private CrossfitBoxRepository crossfitBoxRepository;

    @Mock
    private ScheduleMapper scheduleMapper;

    @InjectMocks
    private ScheduleService scheduleService;

    private CrossfitBox crossfitBox;
    private CrossfitBoxSchedule schedule;
    private ScheduleDto scheduleDto;

    @BeforeEach
    void setUp() {
        crossfitBox = CrossfitBox.builder()
                .id(1L)
                .name("Test Box")
                .email("test@box.com")
                .build();

        schedule = CrossfitBoxSchedule.builder()
                .id(1L)
                .crossfitBox(crossfitBox)
                .dayOfWeek(DayOfWeek.MONDAY)
                .isClosed(false)
                .timeSlots(new ArrayList<>())
                .build();

        scheduleDto = ScheduleDto.builder()
                .id(1L)
                .dayOfWeek(DayOfWeek.MONDAY)
                .isClosed(false)
                .timeSlots(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("시간표 조회 - 기존 스케줄 있음")
    void getSchedule_withExistingSchedules() {
        // given
        when(scheduleRepository.findByCrossfitBoxIdWithTimeSlots(1L))
                .thenReturn(List.of(schedule));
        when(scheduleMapper.toScheduleDto(schedule)).thenReturn(scheduleDto);

        // when
        ScheduleListDto result = scheduleService.getSchedule(1L);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getCrossfitBoxId()).isEqualTo(1L);
        assertThat(result.getSchedules()).hasSize(7); // 7일 전체 반환
    }

    @Test
    @DisplayName("시간표 조회 - 빈 스케줄")
    void getSchedule_emptySchedules() {
        // given
        when(scheduleRepository.findByCrossfitBoxIdWithTimeSlots(1L))
                .thenReturn(List.of());

        // when
        ScheduleListDto result = scheduleService.getSchedule(1L);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getSchedules()).hasSize(7);
        // 모든 스케줄은 빈 timeSlots를 가져야 함
        result.getSchedules().forEach(s -> {
            assertThat(s.getTimeSlots()).isEmpty();
        });
    }

    @Test
    @DisplayName("시간표 전체 업데이트 - 성공")
    void updateSchedule_success() {
        // given
        List<ScheduleDto> scheduleDtos = List.of(
                ScheduleDto.builder()
                        .dayOfWeek(DayOfWeek.MONDAY)
                        .isClosed(false)
                        .timeSlots(List.of(
                                TimeSlotDto.builder()
                                        .startTime("09:00")
                                        .endTime("10:00")
                                        .className("WOD")
                                        .build()
                        ))
                        .build()
        );

        when(crossfitBoxRepository.findById(1L)).thenReturn(Optional.of(crossfitBox));
        when(scheduleRepository.findByCrossfitBoxId(1L)).thenReturn(List.of());
        when(scheduleRepository.save(any(CrossfitBoxSchedule.class))).thenReturn(schedule);
        when(scheduleRepository.findByCrossfitBoxIdWithTimeSlots(1L)).thenReturn(List.of(schedule));
        when(scheduleMapper.toScheduleDto(any())).thenReturn(scheduleDto);
        when(scheduleMapper.parseTime("09:00")).thenReturn(LocalTime.of(9, 0));
        when(scheduleMapper.parseTime("10:00")).thenReturn(LocalTime.of(10, 0));

        // when
        ScheduleListDto result = scheduleService.updateSchedule(1L, scheduleDtos);

        // then
        assertThat(result).isNotNull();
        verify(crossfitBoxRepository).findById(1L);
    }

    @Test
    @DisplayName("시간표 업데이트 - 크로스핏박스 없음")
    void updateSchedule_crossfitBoxNotFound() {
        // given
        List<ScheduleDto> scheduleDtos = List.of(scheduleDto);
        when(crossfitBoxRepository.findById(999L)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> scheduleService.updateSchedule(999L, scheduleDtos))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("CrossfitBox를 찾을 수 없습니다");
    }

    @Test
    @DisplayName("특정 요일 일괄 업데이트 - 성공")
    void updateScheduleForDays_success() {
        // given
        ScheduleUpdateDto updateDto = ScheduleUpdateDto.builder()
                .targetDays(List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY))
                .isClosed(false)
                .timeSlots(List.of(
                        TimeSlotDto.builder()
                                .startTime("09:00")
                                .endTime("10:00")
                                .className("WOD")
                                .build()
                ))
                .build();

        when(crossfitBoxRepository.findById(1L)).thenReturn(Optional.of(crossfitBox));
        when(scheduleRepository.findByCrossfitBoxId(1L)).thenReturn(List.of());
        when(scheduleRepository.save(any(CrossfitBoxSchedule.class))).thenReturn(schedule);
        when(scheduleRepository.findByCrossfitBoxIdWithTimeSlots(1L)).thenReturn(List.of(schedule));
        when(scheduleMapper.toScheduleDto(any())).thenReturn(scheduleDto);
        when(scheduleMapper.parseTime("09:00")).thenReturn(LocalTime.of(9, 0));
        when(scheduleMapper.parseTime("10:00")).thenReturn(LocalTime.of(10, 0));

        // when
        ScheduleListDto result = scheduleService.updateScheduleForDays(1L, updateDto);

        // then
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("특정 요일 업데이트 - 휴무 설정")
    void updateScheduleForDays_setClosed() {
        // given
        ScheduleUpdateDto updateDto = ScheduleUpdateDto.builder()
                .targetDays(List.of(DayOfWeek.SUNDAY))
                .isClosed(true)
                .build();

        when(crossfitBoxRepository.findById(1L)).thenReturn(Optional.of(crossfitBox));
        when(scheduleRepository.findByCrossfitBoxId(1L)).thenReturn(List.of(schedule));
        when(scheduleRepository.findByCrossfitBoxIdWithTimeSlots(1L)).thenReturn(List.of(schedule));
        when(scheduleMapper.toScheduleDto(any())).thenReturn(scheduleDto);

        // when
        ScheduleListDto result = scheduleService.updateScheduleForDays(1L, updateDto);

        // then
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("스케줄 초기화")
    void initializeSchedule() {
        // given
        when(scheduleRepository.save(any(CrossfitBoxSchedule.class))).thenReturn(schedule);

        // when
        scheduleService.initializeSchedule(crossfitBox);

        // then
        verify(scheduleRepository, times(7)).save(any(CrossfitBoxSchedule.class));
    }
}
