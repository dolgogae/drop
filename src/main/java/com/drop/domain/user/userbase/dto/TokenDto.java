package com.drop.domain.user.userbase.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "사용자 token DTO")
public class TokenDto {
    private String accessToken;
    private String refreshToken;
}
