package com.drop.domain.schedule.service;

import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.repository.CrossfitBoxRepository;
import com.drop.domain.schedule.data.CrossfitBoxSchedule;
import com.drop.domain.schedule.data.CrossfitBoxTimeSlot;
import com.drop.domain.schedule.dto.*;
import com.drop.domain.schedule.mapper.ScheduleMapper;
import com.drop.domain.schedule.repository.CrossfitBoxScheduleRepository;
import com.drop.global.enums.DayOfWeek;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleService {

    private final CrossfitBoxScheduleRepository scheduleRepository;
    private final CrossfitBoxRepository crossfitBoxRepository;
    private final ScheduleMapper scheduleMapper;

    /**
     * 특정 CrossfitBox의 시간표 조회
     */
    public ScheduleListDto getSchedule(Long crossfitBoxId) {
        List<CrossfitBoxSchedule> schedules = scheduleRepository.findByCrossfitBoxIdWithTimeSlots(crossfitBoxId);

        List<ScheduleDto> fullSchedules = new ArrayList<>();
        Map<DayOfWeek, CrossfitBoxSchedule> scheduleMap = schedules.stream()
                .collect(Collectors.toMap(CrossfitBoxSchedule::getDayOfWeek, s -> s, (existing, replacement) -> existing));

        for (DayOfWeek day : DayOfWeek.values()) {
            if (scheduleMap.containsKey(day)) {
                fullSchedules.add(scheduleMapper.toScheduleDto(scheduleMap.get(day)));
            } else {
                fullSchedules.add(ScheduleDto.builder()
                        .dayOfWeek(day)
                        .isClosed(false)
                        .timeSlots(new ArrayList<>())
                        .build());
            }
        }

        return ScheduleListDto.builder()
                .crossfitBoxId(crossfitBoxId)
                .schedules(fullSchedules)
                .build();
    }

    /**
     * 시간표 전체 업데이트 (7일 모두)
     */
    @Transactional
    public ScheduleListDto updateSchedule(Long crossfitBoxId, List<ScheduleDto> scheduleDtos) {
        CrossfitBox crossfitBox = crossfitBoxRepository.findById(crossfitBoxId)
                .orElseThrow(() -> new IllegalArgumentException("CrossfitBox를 찾을 수 없습니다."));

        Map<DayOfWeek, CrossfitBoxSchedule> existingSchedules =
                scheduleRepository.findByCrossfitBoxId(crossfitBoxId).stream()
                        .collect(Collectors.toMap(CrossfitBoxSchedule::getDayOfWeek, s -> s, (existing, replacement) -> existing));

        for (ScheduleDto dto : scheduleDtos) {
            CrossfitBoxSchedule schedule = existingSchedules.get(dto.getDayOfWeek());

            if (schedule == null) {
                schedule = CrossfitBoxSchedule.create(crossfitBox, dto.getDayOfWeek());
                scheduleRepository.save(schedule);
            }

            updateScheduleFromDto(schedule, dto);
        }

        return getSchedule(crossfitBoxId);
    }

    /**
     * 특정 요일들 일괄 업데이트 (그룹)
     */
    @Transactional
    public ScheduleListDto updateScheduleForDays(Long crossfitBoxId, ScheduleUpdateDto updateDto) {
        CrossfitBox crossfitBox = crossfitBoxRepository.findById(crossfitBoxId)
                .orElseThrow(() -> new IllegalArgumentException("CrossfitBox를 찾을 수 없습니다."));

        Map<DayOfWeek, CrossfitBoxSchedule> existingSchedules =
                scheduleRepository.findByCrossfitBoxId(crossfitBoxId).stream()
                        .collect(Collectors.toMap(CrossfitBoxSchedule::getDayOfWeek, s -> s, (existing, replacement) -> existing));

        for (DayOfWeek day : updateDto.getTargetDays()) {
            CrossfitBoxSchedule schedule = existingSchedules.get(day);

            if (schedule == null) {
                schedule = CrossfitBoxSchedule.create(crossfitBox, day);
                scheduleRepository.save(schedule);
            }

            schedule.updateIsClosed(updateDto.getIsClosed());

            if (!Boolean.TRUE.equals(updateDto.getIsClosed())) {
                schedule.clearTimeSlots();
                addTimeSlotsFromDto(schedule, updateDto.getTimeSlots());
            }
        }

        return getSchedule(crossfitBoxId);
    }

    /**
     * CrossfitBox 가입 시 빈 시간표 초기화
     */
    @Transactional
    public void initializeSchedule(CrossfitBox crossfitBox) {
        for (DayOfWeek day : DayOfWeek.values()) {
            CrossfitBoxSchedule schedule = CrossfitBoxSchedule.create(crossfitBox, day);
            scheduleRepository.save(schedule);
        }
    }

    private void updateScheduleFromDto(CrossfitBoxSchedule schedule, ScheduleDto dto) {
        schedule.updateIsClosed(dto.getIsClosed());

        if (!Boolean.TRUE.equals(dto.getIsClosed())) {
            schedule.clearTimeSlots();
            addTimeSlotsFromDto(schedule, dto.getTimeSlots());
        }
    }

    private void addTimeSlotsFromDto(CrossfitBoxSchedule schedule, List<TimeSlotDto> timeSlotDtos) {
        if (timeSlotDtos == null) return;

        int order = 0;
        for (TimeSlotDto slotDto : timeSlotDtos) {
            LocalTime startTime = scheduleMapper.parseTime(slotDto.getStartTime());
            LocalTime endTime = slotDto.getEndTime() != null ? scheduleMapper.parseTime(slotDto.getEndTime()) : null;
            CrossfitBoxTimeSlot timeSlot = CrossfitBoxTimeSlot.create(
                    startTime,
                    endTime,
                    slotDto.getClassName(),
                    slotDto.getColor(),
                    slotDto.getDisplayOrder() != null ? slotDto.getDisplayOrder() : order++
            );
            schedule.addTimeSlot(timeSlot);
        }
    }
}
