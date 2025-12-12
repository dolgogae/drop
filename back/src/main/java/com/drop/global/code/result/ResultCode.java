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

    // Place
    PLACE_SEARCH_SUCCESS(200, "P001", "장소 검색 성공"),
    GYM_REGISTER_SUCCESS(201, "P002", "체육관 등록 성공"),
    GYM_LIST_SUCCESS(200, "P003", "등록된 체육관 목록 조회 성공"),
    GYM_DELETE_SUCCESS(200, "P004", "체육관 등록 해제 성공"),
    GYM_UPDATE_SUCCESS(200, "P005", "체육관 정보 수정 성공");

    private int status;
    private final String code;
    private final String message;
}