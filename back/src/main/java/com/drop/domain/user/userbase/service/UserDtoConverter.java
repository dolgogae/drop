package com.drop.domain.user.userbase.service;

import com.drop.domain.user.userbase.dto.UserCreateDto;
import com.drop.domain.user.gym.dto.GymCreateDto;
import com.drop.domain.user.member.dto.MemberCreateDto;
import com.drop.domain.user.trainer.dto.TrainerCreateDto;
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

    public TrainerCreateDto toTrainerDto(UserCreateDto userCreateDto) {
        return toDto(userCreateDto, TrainerCreateDto::new);
    }

    public MemberCreateDto toMemberDto(UserCreateDto userCreateDto) {
        return toDto(userCreateDto, MemberCreateDto::new);
    }

    public GymCreateDto toGymDto(UserCreateDto userCreateDto) {
        return toDto(userCreateDto, GymCreateDto::new);
    }
}
