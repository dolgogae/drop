package com.drop.domain.schedule.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "시간 슬롯 DTO")
public class TimeSlotDto {

    @Schema(description = "시간 슬롯 ID (수정 시 사용)")
    private Long id;

    @NotBlank(message = "시작 시간은 필수입니다")
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "시간 형식이 올바르지 않습니다 (HH:mm)")
    @Schema(description = "시작 시간", example = "07:00")
    private String startTime;

    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "시간 형식이 올바르지 않습니다 (HH:mm)")
    @Schema(description = "종료 시간", example = "08:00")
    private String endTime;

    @NotBlank(message = "수업명은 필수입니다")
    @Schema(description = "수업명", example = "스트렝스 + WOD")
    private String className;

    @Schema(description = "색상", example = "#588157")
    private String color;

    @Schema(description = "표시 순서")
    private Integer displayOrder;
}
