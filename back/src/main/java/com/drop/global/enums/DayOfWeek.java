package com.drop.global.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DayOfWeek {

    MONDAY("월요일", 1),
    TUESDAY("화요일", 2),
    WEDNESDAY("수요일", 3),
    THURSDAY("목요일", 4),
    FRIDAY("금요일", 5),
    SATURDAY("토요일", 6),
    SUNDAY("일요일", 7);

    private final String koreanName;
    private final int order;

    public static DayOfWeek fromOrder(int order) {
        for (DayOfWeek day : DayOfWeek.values()) {
            if (day.getOrder() == order) {
                return day;
            }
        }
        throw new IllegalArgumentException("Invalid day order: " + order);
    }
}
