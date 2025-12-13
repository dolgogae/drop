package com.drop.domain.favorite.controller;

import com.drop.domain.favorite.dto.FavoriteGymDto;
import com.drop.domain.favorite.dto.FavoriteRequestDto;
import com.drop.domain.favorite.service.FavoriteService;
import com.drop.global.code.result.ResultCode;
import com.drop.global.code.result.ResultResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Favorite", description = "내 체육관 (즐겨찾기) API")
@RestController
@RequestMapping("/api/my-gyms")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @Operation(summary = "내 체육관 목록 조회", description = "사용자가 등록한 체육관 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ResultResponse> getMyGyms(
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long memberId = Long.parseLong(userDetails.getUsername());
        List<FavoriteGymDto> myGyms = favoriteService.getMyGyms(memberId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.MY_GYM_LIST_SUCCESS, myGyms));
    }

    @Operation(summary = "내 체육관에 추가", description = "체육관을 내 체육관 목록에 추가합니다.")
    @PostMapping
    public ResponseEntity<ResultResponse> addGymToMyList(
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody FavoriteRequestDto request
    ) {
        Long memberId = Long.parseLong(userDetails.getUsername());
        FavoriteGymDto result = favoriteService.addGymToMyList(memberId, request);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.MY_GYM_ADD_SUCCESS, result));
    }

    @Operation(summary = "즐겨찾기 토글", description = "체육관의 즐겨찾기 상태를 변경합니다.")
    @PatchMapping("/{gymId}/favorite")
    public ResponseEntity<ResultResponse> toggleFavorite(
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long gymId
    ) {
        Long memberId = Long.parseLong(userDetails.getUsername());
        FavoriteGymDto result = favoriteService.toggleFavorite(memberId, gymId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.MY_GYM_FAVORITE_TOGGLE_SUCCESS, result));
    }

    @Operation(summary = "내 체육관에서 제거", description = "체육관을 내 체육관 목록에서 제거합니다.")
    @DeleteMapping("/{gymId}")
    public ResponseEntity<ResultResponse> removeGymFromMyList(
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long gymId
    ) {
        Long memberId = Long.parseLong(userDetails.getUsername());
        favoriteService.removeGymFromMyList(memberId, gymId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.MY_GYM_REMOVE_SUCCESS, null));
    }
}
