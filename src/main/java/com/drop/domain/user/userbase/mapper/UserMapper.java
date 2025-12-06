package com.drop.domain.user.userbase.mapper;

import com.drop.domain.user.userbase.data.UserBase;
import com.drop.domain.user.userbase.dto.UserDto;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    UserDto toDto(UserBase user);
}
