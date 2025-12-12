package com.drop.domain.place.controller;

import com.drop.domain.place.dto.GymRegisterRequestDto;
import com.drop.domain.place.dto.RegisteredGymDto;
import com.drop.domain.place.service.RegisteredGymService;
import com.drop.global.code.result.ResultCode;
import com.drop.global.code.result.ResultResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@Tag(name = "RegisteredGym", description = "등록된 체육관 관리 API")
@RestController
@RequestMapping("/api/gyms")
@RequiredArgsConstructor
public class RegisteredGymController {

    private final RegisteredGymService registeredGymService;

    @Operation(summary = "체육관 등록", description = "카카오 장소를 내 체육관으로 등록합니다.")
    @PostMapping("/register")
    public ResponseEntity<ResultResponse> registerGym(
            @Parameter(hidden = true) @AuthenticationPrincipal Long userId,
            @Valid @RequestBody GymRegisterRequestDto requestDto
    ) {
        RegisteredGymDto result = registeredGymService.registerGym(userId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResultResponse.of(ResultCode.GYM_REGISTER_SUCCESS, result));
    }

    @Operation(summary = "내 체육관 목록 조회", description = "등록된 체육관 목록을 조회합니다.")
    @GetMapping("/my")
    public ResponseEntity<ResultResponse> getMyGyms(
            @Parameter(hidden = true) @AuthenticationPrincipal Long userId
    ) {
        List<RegisteredGymDto> result = registeredGymService.getMyGyms(userId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_LIST_SUCCESS, result));
    }

    @Operation(summary = "즐겨찾기 체육관 목록 조회", description = "즐겨찾기한 체육관 목록을 조회합니다.")
    @GetMapping("/my/favorites")
    public ResponseEntity<ResultResponse> getMyFavoriteGyms(
            @Parameter(hidden = true) @AuthenticationPrincipal Long userId
    ) {
        List<RegisteredGymDto> result = registeredGymService.getMyFavoriteGyms(userId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_LIST_SUCCESS, result));
    }

    @Operation(summary = "체육관 등록 해제", description = "등록된 체육관을 삭제합니다.")
    @DeleteMapping("/{gymId}")
    public ResponseEntity<ResultResponse> deleteGym(
            @Parameter(hidden = true) @AuthenticationPrincipal Long userId,
            @PathVariable Long gymId
    ) {
        registeredGymService.deleteGym(userId, gymId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_DELETE_SUCCESS));
    }

    @Operation(summary = "즐겨찾기 토글", description = "체육관의 즐겨찾기 상태를 토글합니다.")
    @PatchMapping("/{gymId}/favorite")
    public ResponseEntity<ResultResponse> toggleFavorite(
            @Parameter(hidden = true) @AuthenticationPrincipal Long userId,
            @PathVariable Long gymId
    ) {
        RegisteredGymDto result = registeredGymService.toggleFavorite(userId, gymId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_UPDATE_SUCCESS, result));
    }

    @Operation(summary = "메모 수정", description = "체육관의 메모를 수정합니다.")
    @PatchMapping("/{gymId}/note")
    public ResponseEntity<ResultResponse> updateNote(
            @Parameter(hidden = true) @AuthenticationPrincipal Long userId,
            @PathVariable Long gymId,
            @RequestBody Map<String, String> request
    ) {
        RegisteredGymDto result = registeredGymService.updateNote(userId, gymId, request.get("note"));
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_UPDATE_SUCCESS, result));
    }
}
