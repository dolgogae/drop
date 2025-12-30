package com.drop.domain.mypage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyPageProfileDto {
    private Long id;
    private String email;
    private String username;
    private String profileImage;
    private Boolean notificationEnabled;
    private String role;
}
