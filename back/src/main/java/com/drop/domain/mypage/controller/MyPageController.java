package com.drop.domain.mypage.controller;

import com.drop.domain.mypage.dto.MyPageProfileDto;
import com.drop.domain.mypage.dto.NotificationSettingDto;
import com.drop.domain.mypage.dto.PasswordChangeRequestDto;
import com.drop.domain.mypage.dto.ProfileUpdateRequestDto;
import com.drop.domain.mypage.service.MyPageService;
import com.drop.domain.review.dto.MyReviewListResponseDto;
import com.drop.domain.review.service.ReviewService;
import com.drop.global.code.result.ResultCode;
import com.drop.global.code.result.ResultResponse;
import com.drop.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;

@Slf4j
@Tag(name = "MyPage", description = "마이페이지 API")
@RestController
@RequestMapping("/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;
    private final ReviewService reviewService;

    @Operation(summary = "내 프로필 조회", description = "로그인한 사용자의 프로필 정보를 조회합니다.")
    @GetMapping("/profile")
    public ResponseEntity<ResultResponse> getMyProfile(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        MyPageProfileDto profile = myPageService.getMyProfile(userDetails.getId(), userDetails.getUserRole());
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GET_MY_INFO_SUCCESS, profile));
    }

    @Operation(summary = "프로필 수정", description = "닉네임을 수정합니다.")
    @PatchMapping("/profile")
    public ResponseEntity<ResultResponse> updateProfile(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid ProfileUpdateRequestDto dto
    ) {
        myPageService.updateProfile(userDetails.getId(), dto);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.PROFILE_UPDATE_SUCCESS, null));
    }

    @Operation(summary = "내 리뷰 목록 조회", description = "로그인한 사용자가 작성한 리뷰 목록을 조회합니다.")
    @GetMapping("/reviews")
    public ResponseEntity<ResultResponse> getMyReviews(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        MyReviewListResponseDto reviews = reviewService.getMyReviews(userDetails.getId(), page, size);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.MY_REVIEW_LIST_SUCCESS, reviews));
    }

    @Operation(summary = "비밀번호 변경", description = "비밀번호를 변경합니다.")
    @PatchMapping("/password")
    public ResponseEntity<ResultResponse> changePassword(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid PasswordChangeRequestDto dto
    ) {
        myPageService.changePassword(userDetails.getId(), dto);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.PASSWORD_CHANGE_SUCCESS, null));
    }

    @Operation(summary = "로그아웃", description = "로그아웃합니다.")
    @PostMapping("/logout")
    public ResponseEntity<ResultResponse> logout(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader("Authorization") String authorization
    ) {
        String accessToken = authorization.replace("Bearer ", "");
        myPageService.logout(userDetails.getId(), accessToken);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.LOGOUT_SUCCESS, null));
    }

    @Operation(summary = "회원 탈퇴", description = "회원을 탈퇴합니다.")
    @DeleteMapping("/withdraw")
    public ResponseEntity<ResultResponse> withdraw(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        myPageService.withdraw(userDetails.getId());
        return ResponseEntity.ok(ResultResponse.of(ResultCode.WITHDRAW_SUCCESS, null));
    }

    @Operation(summary = "알림 설정 변경", description = "알림 설정을 변경합니다.")
    @PatchMapping("/notification")
    public ResponseEntity<ResultResponse> updateNotificationSetting(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody NotificationSettingDto dto
    ) {
        myPageService.updateNotificationSetting(userDetails.getId(), dto);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.NOTIFICATION_UPDATE_SUCCESS, null));
    }

    @Operation(summary = "프로필 사진 업로드", description = "프로필 사진을 업로드합니다.")
    @PostMapping(value = "/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResultResponse> uploadProfileImage(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file
    ) {
        String fileName = myPageService.uploadProfileImage(userDetails.getId(), file);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.PROFILE_IMAGE_UPLOAD_SUCCESS, fileName));
    }

    @Operation(summary = "프로필 사진 삭제", description = "프로필 사진을 삭제합니다.")
    @DeleteMapping("/profile-image")
    public ResponseEntity<ResultResponse> deleteProfileImage(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        myPageService.deleteProfileImage(userDetails.getId());
        return ResponseEntity.ok(ResultResponse.of(ResultCode.PROFILE_IMAGE_DELETE_SUCCESS, null));
    }

    @Operation(summary = "My Box 조회", description = "현재 설정된 My Box ID를 조회합니다.")
    @GetMapping("/home-box")
    public ResponseEntity<ResultResponse> getHomeBox(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long homeBoxId = myPageService.getHomeBoxId(userDetails.getId());
        return ResponseEntity.ok(ResultResponse.of(ResultCode.GET_MY_INFO_SUCCESS, homeBoxId));
    }

    @Operation(summary = "My Box 설정", description = "My Box를 설정합니다.")
    @PatchMapping("/home-box/{crossfitBoxId}")
    public ResponseEntity<ResultResponse> setHomeBox(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long crossfitBoxId
    ) {
        myPageService.setHomeBox(userDetails.getId(), crossfitBoxId);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.MY_BOX_SET_SUCCESS, null));
    }

    @Operation(summary = "My Box 해제", description = "My Box를 해제합니다.")
    @DeleteMapping("/home-box")
    public ResponseEntity<ResultResponse> clearHomeBox(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        myPageService.setHomeBox(userDetails.getId(), null);
        return ResponseEntity.ok(ResultResponse.of(ResultCode.MY_BOX_CLEAR_SUCCESS, null));
    }
}
