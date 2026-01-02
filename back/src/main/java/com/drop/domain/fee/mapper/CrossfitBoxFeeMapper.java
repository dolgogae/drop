package com.drop.domain.fee.mapper;

import com.drop.domain.fee.data.CrossfitBoxFee;
import com.drop.domain.fee.dto.CrossfitBoxFeeDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface CrossfitBoxFeeMapper {
    CrossfitBoxFeeMapper INSTANCE = Mappers.getMapper(CrossfitBoxFeeMapper.class);
    @Mapping(source = "crossfitBox.id", target = "crossfitBoxId")
    CrossfitBoxFeeDto toDto(CrossfitBoxFee crossfitBoxFee);
}
