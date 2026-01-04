package com.drop.domain.schedule.dto;

import com.drop.global.enums.DayOfWeek;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "특정 요일들 일괄 업데이트 DTO")
public class ScheduleUpdateDto {

    @NotEmpty(message = "대상 요일을 선택해주세요")
    @Schema(description = "업데이트할 요일들", example = "[\"MONDAY\", \"TUESDAY\", \"WEDNESDAY\"]")
    private List<DayOfWeek> targetDays;

    @Schema(description = "휴무 여부", example = "false")
    private Boolean isClosed;

    @Valid
    @Schema(description = "시간 슬롯 목록 (휴무가 아닐 경우)")
    @Builder.Default
    private List<TimeSlotDto> timeSlots = new ArrayList<>();
}
