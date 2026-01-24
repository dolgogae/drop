package com.drop.global.security.jwt;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TokenDto {
    private final String accessToken;
    private final String refreshToken;
    private final Long accessTokenExpiresIn;
}