package com.drop.domain.user.userbase.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import javax.validation.constraints.NotBlank;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "Google OAuth DTO")
public class GoogleAuthDto {
    @NotBlank
    @Schema(description = "Google ID Token", example = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String idToken;

    @Schema(description = "Google Access Token")
    private String accessToken;
}
