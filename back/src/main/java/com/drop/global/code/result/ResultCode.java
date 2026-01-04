package com.drop.global.code.result;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ResultCode {

    // Member
    REGISTER_SUCCESS(200, "M001", "회원가입 되었습니다."),
    LOGIN_SUCCESS(200, "M002", "로그인 되었습니다."),
    REISSUE_SUCCESS(200, "M003", "재발급 되었습니다."),
    LOGOUT_SUCCESS(200, "M004", "로그아웃 되었습니다."),
    GET_MY_INFO_SUCCESS(200, "M005", "내 정보 조회 완료"),

    // Gym
    GYM_LIST_SUCCESS(200, "G001", "체육관 목록 조회 성공"),
    GYM_DETAIL_SUCCESS(200, "G002", "체육관 상세 조회 성공"),

    // Home
    HOME_SUMMARY_SUCCESS(200, "H001", "홈 화면 정보 조회 성공"),

    // My Gym (Favorite)
    MY_GYM_LIST_SUCCESS(200, "F001", "내 체육관 목록 조회 성공"),
    MY_GYM_ADD_SUCCESS(200, "F002", "내 체육관에 추가 성공"),
    MY_GYM_FAVORITE_TOGGLE_SUCCESS(200, "F003", "즐겨찾기 상태 변경 성공"),
    MY_GYM_REMOVE_SUCCESS(200, "F004", "내 체육관에서 제거 성공"),

    // MyPage
    PROFILE_UPDATE_SUCCESS(200, "MP001", "프로필이 수정되었습니다."),
    PASSWORD_CHANGE_SUCCESS(200, "MP002", "비밀번호가 변경되었습니다."),
    WITHDRAW_SUCCESS(200, "MP003", "회원 탈퇴가 완료되었습니다."),
    NOTIFICATION_UPDATE_SUCCESS(200, "MP004", "알림 설정이 변경되었습니다."),
    PROFILE_IMAGE_UPLOAD_SUCCESS(200, "MP005", "프로필 사진이 등록되었습니다."),
    PROFILE_IMAGE_DELETE_SUCCESS(200, "MP006", "프로필 사진이 삭제되었습니다."),

    // Schedule
    SCHEDULE_GET_SUCCESS(200, "S001", "시간표 조회 성공"),
    SCHEDULE_UPDATE_SUCCESS(200, "S002", "시간표 수정 성공");

    private int status;
    private final String code;
    private final String message;
}