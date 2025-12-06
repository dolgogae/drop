package com.drop.domain.user.trainer.mapper;

import com.drop.domain.user.trainer.data.Trainer;
import com.drop.domain.user.trainer.dto.TrainerDto;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface TrainerMapper {
    TrainerMapper INSTANCE = Mappers.getMapper(TrainerMapper.class);

    TrainerDto toDto(Trainer trainer);
}
