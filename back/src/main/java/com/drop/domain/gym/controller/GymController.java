package com.drop.domain.gym.controller;

import com.drop.domain.gym.dto.GymDto;
import com.drop.domain.gym.service.GymService;
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

@Tag(name = "Gym", description = "체육관 API")
@RestController
@RequestMapping("/gyms")
@RequiredArgsConstructor
public class GymController {

    private final GymService gymService;

    @Operation(summary = "체육관 이름 검색", description = "체육관 이름으로 검색합니다.")
    @GetMapping("/search")
    public ResponseEntity<ResultResponse> searchGyms(
            @Parameter(description = "검색 키워드") @RequestParam String keyword
    ) {
        List<GymDto> gyms = gymService.searchByName(keyword);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_LIST_SUCCESS, gyms));
    }

    @Operation(summary = "전체 체육관 목록 조회 (지도용)", description = "위치 정보가 있는 모든 체육관을 조회합니다.")
    @GetMapping("/map")
    public ResponseEntity<ResultResponse> getAllGymsForMap() {
        List<GymDto> gyms = gymService.getAllGymsWithLocation();
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_LIST_SUCCESS, gyms));
    }

    @Operation(summary = "영역 내 체육관 목록 조회", description = "지정된 영역(bounds) 내의 체육관을 조회합니다.")
    @GetMapping("/map/bounds")
    public ResponseEntity<ResultResponse> getGymsByBounds(
            @Parameter(description = "남서쪽 위도") @RequestParam Double swLat,
            @Parameter(description = "남서쪽 경도") @RequestParam Double swLng,
            @Parameter(description = "북동쪽 위도") @RequestParam Double neLat,
            @Parameter(description = "북동쪽 경도") @RequestParam Double neLng
    ) {
        List<GymDto> gyms = gymService.getGymsByBounds(swLat, swLng, neLat, neLng);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_LIST_SUCCESS, gyms));
    }

    @Operation(summary = "체육관 상세 조회", description = "체육관 ID로 상세 정보를 조회합니다.")
    @GetMapping("/{gymId}")
    public ResponseEntity<ResultResponse> getGymById(
            @Parameter(description = "체육관 ID") @PathVariable Long gymId
    ) {
        GymDto gym = gymService.getGymById(gymId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_DETAIL_SUCCESS, gym));
    }
}
