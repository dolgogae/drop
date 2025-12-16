package com.drop.global.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum LocationMode {

    CURRENT("current", "현재 위치 기준"),
    LAST("last", "마지막으로 본 위치");

    private final String value;
    private final String description;

    public static LocationMode fromValue(String value) {
        if (value == null) {
            return CURRENT;  // 기본값
        }
        for (LocationMode mode : LocationMode.values()) {
            if (mode.getValue().equalsIgnoreCase(value)) {
                return mode;
            }
        }
        return CURRENT;  // 잘못된 값이면 기본값 반환
    }
}
