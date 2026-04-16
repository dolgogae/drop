package com.drop.domain.member.dto;

import com.drop.domain.auth.dto.UserCreateDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@ToString
@SuperBuilder
@NoArgsConstructor
@Schema(description = "멤버(고객) 생성 DTO")
public class MemberCreateDto extends UserCreateDto {
}
