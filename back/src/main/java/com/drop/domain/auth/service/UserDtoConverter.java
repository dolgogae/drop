package com.drop.domain.auth.service;

import com.drop.domain.auth.dto.UserCreateDto;
import com.drop.domain.crossfitbox.dto.CrossfitBoxCreateDto;
import com.drop.domain.member.dto.MemberCreateDto;
import org.springframework.stereotype.Service;

import java.util.function.Supplier;

@Service
public class UserDtoConverter {
    public <T extends UserCreateDto> T toDto(UserCreateDto userCreateDto, Supplier<T> constructor) {
        T dto = constructor.get();
        dto.setUsername(userCreateDto.getUsername());
        dto.setEmail(userCreateDto.getEmail());
        dto.setPassword(userCreateDto.getPassword());
        dto.setRole(userCreateDto.getRole());
        return dto;
    }

    public MemberCreateDto toMemberDto(UserCreateDto userCreateDto) {
        return toDto(userCreateDto, MemberCreateDto::new);
    }

    public CrossfitBoxCreateDto toCrossfitBoxDto(UserCreateDto userCreateDto) {
        return toDto(userCreateDto, CrossfitBoxCreateDto::new);
    }
}
