package com.drop.domain.auth.dto;

import lombok.*;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GoogleUserInfo {
    private String sub;        // Google 고유 ID
    private String email;
    private Boolean emailVerified;
    private String name;
    private String picture;
    private String givenName;
    private String familyName;
}
