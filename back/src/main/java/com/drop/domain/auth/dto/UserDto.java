package com.drop.domain.auth.dto;

import com.drop.global.enums.UserRole;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@ToString
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

    protected Long id;
    protected String username;
    protected String email;
    protected String password;
    protected UserRole role;
}
