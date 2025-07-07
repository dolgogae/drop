package com.drop.domain.user.member.dto;

import com.drop.domain.user.userbase.dto.UserCreateDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Schema(description = "멤버(고객) 생성 DTO")
public class MemberCreateDto extends UserCreateDto {
    // TODO: need to add member's column
    private String exampleColumn;
}
