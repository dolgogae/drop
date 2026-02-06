package com.drop.domain.crossfitbox.mapper;

import com.drop.domain.base.Address;
import com.drop.domain.base.AddressDto;
import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.dto.CrossfitBoxDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface CrossfitBoxMapper {
    CrossfitBoxMapper INSTANCE = Mappers.getMapper(CrossfitBoxMapper.class);

    @Mapping(source = "address", target = "address", qualifiedByName = "addressToDto")
    CrossfitBoxDto toDto(CrossfitBox crossfitBox);

    @Named("addressToDto")
    default AddressDto addressToDto(Address address) {
        return AddressDto.fromEntity(address);
    }
}
