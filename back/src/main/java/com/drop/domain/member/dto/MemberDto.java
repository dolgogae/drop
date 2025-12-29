package com.drop.domain.member.dto;

import com.drop.domain.auth.dto.UserDto;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@ToString
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class MemberDto extends UserDto {
    private String exampleColumn;
}
