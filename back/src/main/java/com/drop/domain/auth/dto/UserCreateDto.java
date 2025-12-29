package com.drop.domain.auth.dto;

import com.drop.global.enums.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.SuperBuilder;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Schema(description = "사용자 생성 DTO")
public class UserCreateDto {
    @NotBlank
    @Size(min = 2, message = "Username length must be greater than 2.")
    @Schema(description = "사용자 이름", example = "홍길동")
    protected String username;

    @NotBlank
    @Email(message = "Not Valid Email")
    @Schema(description = "사용자 email", example = "abc@gmail.com")
    protected String email;

    @NotBlank
    @Size(min = 2, message = "Password length must be greater than 2.")
    @Schema(description = "사용자 비밀번호", example = "1234!@#")
    protected String password;

    @Schema(description = "사용자 권한", example = "MEMBER")
    protected UserRole role;
}
