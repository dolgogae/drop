package com.drop.domain.home.controller;

import com.drop.domain.home.dto.HomeSummaryDto;
import com.drop.domain.home.service.HomeService;
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

@Tag(name = "Home", description = "홈 화면 API")
@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @Operation(summary = "홈 화면 요약 조회", description = "홈 화면에 필요한 근처 체육관 개수와 내 체육관 미리보기를 조회합니다.")
    @GetMapping("/summary")
    public ResponseEntity<ResultResponse> getHomeSummary(
            @Parameter(description = "위치 모드 (current: 현재 위치, last: 마지막 위치)")
            @RequestParam(required = false, defaultValue = "current") String locationMode,
            @Parameter(description = "위도 (grid 단위)")
            @RequestParam(required = false) Double latGrid,
            @Parameter(description = "경도 (grid 단위)")
            @RequestParam(required = false) Double lngGrid
    ) {
        HomeSummaryDto summary = homeService.getHomeSummary(locationMode, latGrid, lngGrid);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.HOME_SUMMARY_SUCCESS, summary));
    }
}
