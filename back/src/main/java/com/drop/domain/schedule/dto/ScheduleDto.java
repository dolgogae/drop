package com.drop.domain.schedule.dto;

import com.drop.global.enums.DayOfWeek;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "요일별 스케줄 DTO")
public class ScheduleDto {

    @Schema(description = "스케줄 ID")
    private Long id;

    @NotNull(message = "요일은 필수입니다")
    @Schema(description = "요일", example = "MONDAY")
    private DayOfWeek dayOfWeek;

    @Schema(description = "휴무 여부", example = "false")
    @Builder.Default
    private Boolean isClosed = false;

    @Valid
    @Schema(description = "시간 슬롯 목록")
    @Builder.Default
    private List<TimeSlotDto> timeSlots = new ArrayList<>();
}
