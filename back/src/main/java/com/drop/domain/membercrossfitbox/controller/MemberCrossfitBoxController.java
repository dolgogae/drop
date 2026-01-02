package com.drop.domain.membercrossfitbox.controller;

import com.drop.domain.membercrossfitbox.dto.MemberCrossfitBoxDto;
import com.drop.domain.membercrossfitbox.dto.MemberCrossfitBoxRequestDto;
import com.drop.domain.membercrossfitbox.service.MemberCrossfitBoxService;
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

import java.util.List;

@Tag(name = "MemberCrossfitBox", description = "내 크로스핏박스 (즐겨찾기) API")
@RestController
@RequestMapping("/member-crossfit-box")
@RequiredArgsConstructor
public class MemberCrossfitBoxController {

    private final MemberCrossfitBoxService memberCrossfitBoxService;

    @Operation(summary = "내 크로스핏박스 목록 조회", description = "사용자가 등록한 크로스핏박스 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ResultResponse> getMyCrossfitBoxes(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long memberId = userDetails.getId();
        List<MemberCrossfitBoxDto> myCrossfitBoxes = memberCrossfitBoxService.getMyCrossfitBoxes(memberId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.MY_GYM_LIST_SUCCESS, myCrossfitBoxes));
    }

    @Operation(summary = "내 크로스핏박스에 추가", description = "크로스핏박스를 내 크로스핏박스 목록에 추가합니다.")
    @PostMapping
    public ResponseEntity<ResultResponse> addCrossfitBoxToMyList(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody MemberCrossfitBoxRequestDto request
    ) {
        Long memberId = userDetails.getId();
        MemberCrossfitBoxDto result = memberCrossfitBoxService.addCrossfitBoxToMyList(memberId, request);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.MY_GYM_ADD_SUCCESS, result));
    }

    @Operation(summary = "즐겨찾기 토글", description = "크로스핏박스의 즐겨찾기 상태를 변경합니다.")
    @PatchMapping("/{crossfitBoxId}/favorite")
    public ResponseEntity<ResultResponse> toggleFavorite(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long crossfitBoxId
    ) {
        Long memberId = userDetails.getId();
        MemberCrossfitBoxDto result = memberCrossfitBoxService.toggleFavorite(memberId, crossfitBoxId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.MY_GYM_FAVORITE_TOGGLE_SUCCESS, result));
    }

    @Operation(summary = "내 크로스핏박스에서 제거", description = "크로스핏박스를 내 크로스핏박스 목록에서 제거합니다.")
    @DeleteMapping("/{crossfitBoxId}")
    public ResponseEntity<ResultResponse> removeCrossfitBoxFromMyList(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long crossfitBoxId
    ) {
        Long memberId = userDetails.getId();
        memberCrossfitBoxService.removeCrossfitBoxFromMyList(memberId, crossfitBoxId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.MY_GYM_REMOVE_SUCCESS, null));
    }
}
