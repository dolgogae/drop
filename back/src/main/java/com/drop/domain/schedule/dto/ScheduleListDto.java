package com.drop.domain.schedule.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "전체 시간표 DTO (7일)")
public class ScheduleListDto {

    @Schema(description = "CrossfitBox ID")
    private Long crossfitBoxId;

    @Schema(description = "요일별 스케줄 목록 (7일)")
    @Builder.Default
    private List<ScheduleDto> schedules = new ArrayList<>();
}
