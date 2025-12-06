package com.drop.domain.fee.mapper;

import com.drop.domain.fee.data.GymFee;
import com.drop.domain.fee.dto.GymFeeDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface GymFeeMapper {
    GymFeeMapper INSTANCE = Mappers.getMapper(GymFeeMapper.class);
    @Mapping(source = "gym.id", target = "gymId")
    GymFeeDto toDto(GymFee gymFee);
}