package com.drop.domain.crossfitbox.controller;

import com.drop.domain.crossfitbox.dto.CrossfitBoxDto;
import com.drop.domain.crossfitbox.dto.CrossfitBoxUpdateDto;
import com.drop.domain.crossfitbox.service.CrossfitBoxService;
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

@Tag(name = "BoxAdmin", description = "박스 어드민 API")
@RestController
@RequestMapping("/box")
@RequiredArgsConstructor
public class BoxAdminController {

    private final CrossfitBoxService crossfitBoxService;

    @Operation(summary = "내 Box 정보 조회", description = "로그인한 CrossfitBox의 정보를 조회합니다.")
    @GetMapping("/my")
    public ResponseEntity<ResultResponse> getMyBoxInfo(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long crossfitBoxId = userDetails.getId();
        CrossfitBoxDto boxInfo = crossfitBoxService.getCrossfitBoxById(crossfitBoxId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_DETAIL_SUCCESS, boxInfo));
    }

    @Operation(summary = "내 Box 정보 수정", description = "로그인한 CrossfitBox의 정보를 수정합니다.")
    @PutMapping("/my")
    public ResponseEntity<ResultResponse> updateMyBoxInfo(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid CrossfitBoxUpdateDto updateDto
    ) {
        Long crossfitBoxId = userDetails.getId();
        CrossfitBoxDto updatedBox = crossfitBoxService.updateCrossfitBox(crossfitBoxId, updateDto);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_UPDATE_SUCCESS, updatedBox));
    }
}
