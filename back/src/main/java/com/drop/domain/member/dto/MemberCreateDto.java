package com.drop.domain.member.dto;

import com.drop.domain.auth.dto.UserCreateDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.SuperBuilder;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

@Getter
@Setter
@ToString
@SuperBuilder
@NoArgsConstructor
@Schema(description = "멤버(고객) 생성 DTO")
public class MemberCreateDto extends UserCreateDto {
    // 일반 회원은 이메일 형식 필수
    @NotBlank
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Schema(description = "사용자 이메일", example = "user@example.com")
    protected String email;
}
