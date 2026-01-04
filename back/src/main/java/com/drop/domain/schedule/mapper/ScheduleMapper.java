package com.drop.domain.schedule.mapper;

import com.drop.domain.schedule.data.CrossfitBoxSchedule;
import com.drop.domain.schedule.data.CrossfitBoxTimeSlot;
import com.drop.domain.schedule.dto.ScheduleDto;
import com.drop.domain.schedule.dto.ScheduleListDto;
import com.drop.domain.schedule.dto.TimeSlotDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ScheduleMapper {

    DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Mapping(source = "timeSlots", target = "timeSlots", qualifiedByName = "timeSlotsToDto")
    ScheduleDto toScheduleDto(CrossfitBoxSchedule schedule);

    List<ScheduleDto> toScheduleDtoList(List<CrossfitBoxSchedule> schedules);

    @Named("timeSlotsToDto")
    default List<TimeSlotDto> timeSlotsToDto(List<CrossfitBoxTimeSlot> timeSlots) {
        if (timeSlots == null) {
            return List.of();
        }
        return timeSlots.stream()
                .map(this::toTimeSlotDto)
                .collect(Collectors.toList());
    }

    default TimeSlotDto toTimeSlotDto(CrossfitBoxTimeSlot timeSlot) {
        return TimeSlotDto.builder()
                .id(timeSlot.getId())
                .startTime(timeSlot.getStartTime().format(TIME_FORMATTER))
                .endTime(timeSlot.getEndTime() != null ? timeSlot.getEndTime().format(TIME_FORMATTER) : null)
                .className(timeSlot.getClassName())
                .color(timeSlot.getColor())
                .displayOrder(timeSlot.getDisplayOrder())
                .build();
    }

    default ScheduleListDto toScheduleListDto(Long crossfitBoxId, List<CrossfitBoxSchedule> schedules) {
        return ScheduleListDto.builder()
                .crossfitBoxId(crossfitBoxId)
                .schedules(toScheduleDtoList(schedules))
                .build();
    }

    default LocalTime parseTime(String timeString) {
        return LocalTime.parse(timeString, TIME_FORMATTER);
    }
}
