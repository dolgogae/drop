package com.drop.domain.dashboard.controller;

import com.drop.domain.dashboard.dto.DashboardSummaryDto;
import com.drop.domain.dashboard.service.DashboardService;
import com.drop.global.code.result.ResultCode;
import com.drop.global.code.result.ResultResponse;
import com.drop.global.enums.LocationMode;
import com.drop.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Dashboard", description = "대시보드 API")
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "대시보드 요약 조회", description = "대시보드에 필요한 근처 체육관 개수와 내 체육관 미리보기를 조회합니다.")
    @GetMapping("/summary")
    public ResponseEntity<ResultResponse> getDashboardSummary(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "위치 모드 (CURRENT: 현재 위치, LAST: 마지막 위치)")
            @RequestParam(required = false) String locationMode,
            @Parameter(description = "위도 (grid 단위)")
            @RequestParam(required = false) Double latGrid,
            @Parameter(description = "경도 (grid 단위)")
            @RequestParam(required = false) Double lngGrid
    ) {
        Long memberId = userDetails != null ? userDetails.getId() : null;

        LocationMode mode = LocationMode.fromValue(locationMode);
        DashboardSummaryDto summary = dashboardService.getDashboardSummary(memberId, mode, latGrid, lngGrid);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.DASHBOARD_SUMMARY_SUCCESS, summary));
    }
}
