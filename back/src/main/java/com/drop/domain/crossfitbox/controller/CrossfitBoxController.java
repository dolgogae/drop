package com.drop.domain.crossfitbox.controller;

import com.drop.domain.crossfitbox.dto.CrossfitBoxDto;
import com.drop.domain.crossfitbox.service.CrossfitBoxService;
import com.drop.domain.schedule.dto.ScheduleListDto;
import com.drop.domain.schedule.service.ScheduleService;
import com.drop.global.code.result.ResultCode;
import com.drop.global.code.result.ResultResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "CrossfitBox", description = "크로스핏박스 API")
@RestController
@RequestMapping("/crossfit-boxes")
@RequiredArgsConstructor
public class CrossfitBoxController {

    private final CrossfitBoxService crossfitBoxService;
    private final ScheduleService scheduleService;

    @Operation(summary = "크로스핏박스 이름 검색", description = "크로스핏박스 이름으로 검색합니다.")
    @GetMapping("/search")
    public ResponseEntity<ResultResponse> searchCrossfitBoxes(
            @Parameter(description = "검색 키워드") @RequestParam String keyword
    ) {
        List<CrossfitBoxDto> crossfitBoxes = crossfitBoxService.searchByName(keyword);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_LIST_SUCCESS, crossfitBoxes));
    }

    @Operation(summary = "전체 크로스핏박스 목록 조회 (지도용)", description = "위치 정보가 있는 모든 크로스핏박스를 조회합니다.")
    @GetMapping("/map")
    public ResponseEntity<ResultResponse> getAllCrossfitBoxesForMap() {
        List<CrossfitBoxDto> crossfitBoxes = crossfitBoxService.getAllCrossfitBoxesWithLocation();
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_LIST_SUCCESS, crossfitBoxes));
    }

    @Operation(summary = "영역 내 크로스핏박스 목록 조회", description = "지정된 영역(bounds) 내의 크로스핏박스를 조회합니다.")
    @GetMapping("/map/bounds")
    public ResponseEntity<ResultResponse> getCrossfitBoxesByBounds(
            @Parameter(description = "남서쪽 위도") @RequestParam Double swLat,
            @Parameter(description = "남서쪽 경도") @RequestParam Double swLng,
            @Parameter(description = "북동쪽 위도") @RequestParam Double neLat,
            @Parameter(description = "북동쪽 경도") @RequestParam Double neLng
    ) {
        List<CrossfitBoxDto> crossfitBoxes = crossfitBoxService.getCrossfitBoxesByBounds(swLat, swLng, neLat, neLng);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_LIST_SUCCESS, crossfitBoxes));
    }

    @Operation(summary = "크로스핏박스 상세 조회", description = "크로스핏박스 ID로 상세 정보를 조회합니다.")
    @GetMapping("/{crossfitBoxId}")
    public ResponseEntity<ResultResponse> getCrossfitBoxById(
            @Parameter(description = "크로스핏박스 ID") @PathVariable Long crossfitBoxId
    ) {
        CrossfitBoxDto crossfitBox = crossfitBoxService.getCrossfitBoxById(crossfitBoxId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_DETAIL_SUCCESS, crossfitBox));
    }

    @Operation(summary = "크로스핏박스 시간표 조회", description = "크로스핏박스의 시간표를 조회합니다.")
    @GetMapping("/{crossfitBoxId}/schedule")
    public ResponseEntity<ResultResponse> getCrossfitBoxSchedule(
            @Parameter(description = "크로스핏박스 ID") @PathVariable Long crossfitBoxId
    ) {
        ScheduleListDto schedule = scheduleService.getSchedule(crossfitBoxId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.SCHEDULE_GET_SUCCESS, schedule));
    }
}
