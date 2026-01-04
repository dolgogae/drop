package com.drop.domain.schedule.controller;

import com.drop.domain.schedule.dto.ScheduleDto;
import com.drop.domain.schedule.dto.ScheduleListDto;
import com.drop.domain.schedule.dto.ScheduleUpdateDto;
import com.drop.domain.schedule.service.ScheduleService;
import com.drop.global.code.result.ResultCode;
import com.drop.global.code.result.ResultResponse;
import com.drop.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@Tag(name = "Schedule", description = "시간표 API")
@RestController
@RequestMapping("/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @Operation(summary = "내 Box 시간표 조회", description = "로그인한 CrossfitBox의 시간표를 조회합니다.")
    @GetMapping("/my")
    public ResponseEntity<ResultResponse> getMySchedule(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long crossfitBoxId = userDetails.getId();
        ScheduleListDto schedule = scheduleService.getSchedule(crossfitBoxId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.SCHEDULE_GET_SUCCESS, schedule));
    }

    @Operation(summary = "시간표 전체 업데이트", description = "시간표를 전체 업데이트합니다 (7일 모두).")
    @PutMapping("/my")
    public ResponseEntity<ResultResponse> updateSchedule(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid List<ScheduleDto> scheduleDtos
    ) {
        Long crossfitBoxId = userDetails.getId();
        ScheduleListDto schedule = scheduleService.updateSchedule(crossfitBoxId, scheduleDtos);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.SCHEDULE_UPDATE_SUCCESS, schedule));
    }

    @Operation(summary = "특정 요일들 일괄 업데이트", description = "선택한 요일들에 동일한 시간표를 적용합니다.")
    @PutMapping("/my/days")
    public ResponseEntity<ResultResponse> updateScheduleForDays(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid ScheduleUpdateDto updateDto
    ) {
        Long crossfitBoxId = userDetails.getId();
        ScheduleListDto schedule = scheduleService.updateScheduleForDays(crossfitBoxId, updateDto);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.SCHEDULE_UPDATE_SUCCESS, schedule));
    }
}
