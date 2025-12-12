package com.drop.domain.place.controller;

import com.drop.domain.place.dto.PlaceSearchResponseDto;
import com.drop.domain.place.service.KakaoPlaceService;
import com.drop.global.code.result.ResultCode;
import com.drop.global.code.result.ResultResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Place", description = "장소 검색 API")
@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final KakaoPlaceService kakaoPlaceService;

    @Operation(summary = "체육관/헬스장 검색", description = "화면 영역(bounds) 내의 체육관을 검색합니다.")
    @GetMapping("/gyms")
    public ResponseEntity<ResultResponse> searchGyms(
            @Parameter(description = "남서쪽 위도") @RequestParam Double swLat,
            @Parameter(description = "남서쪽 경도") @RequestParam Double swLng,
            @Parameter(description = "북동쪽 위도") @RequestParam Double neLat,
            @Parameter(description = "북동쪽 경도") @RequestParam Double neLng,
            @Parameter(description = "검색 키워드 (기본값: 크로스핏)") @RequestParam(defaultValue = "크로스핏") String q
    ) {
        PlaceSearchResponseDto result = kakaoPlaceService.searchPlacesByRect(swLat, swLng, neLat, neLng, q);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.PLACE_SEARCH_SUCCESS, result));
    }
}
