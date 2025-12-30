package com.drop.domain.auth.dto;

import lombok.*;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponseDto {

    private Long id;

    @NotBlank
    @Size(min = 2, message = "Username length must be greater than 2.")
    private String username;

    @NotBlank
    @Email(message = "Not Valid Email")
    private String email;

    @NotBlank
    @Size(min = 2, message = "Password length must be greater than 2.")
    private String password;

    private String role;
}
