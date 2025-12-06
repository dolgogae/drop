package com.drop.domain.user.gym.mapper;

import com.drop.domain.user.gym.data.Gym;
import com.drop.domain.user.gym.dto.GymDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface GymMapper {
    GymMapper INSTANCE = Mappers.getMapper(GymMapper.class);

    @Mapping(source = "usageInfo", target = "usageInfoDto")
    GymDto toDto(Gym gym);
}
