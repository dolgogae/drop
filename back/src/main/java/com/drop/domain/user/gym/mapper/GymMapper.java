package com.drop.domain.user.gym.mapper;

import com.drop.domain.base.Address;
import com.drop.domain.base.AddressDto;
import com.drop.domain.user.gym.data.Gym;
import com.drop.domain.user.gym.dto.GymDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface GymMapper {
    GymMapper INSTANCE = Mappers.getMapper(GymMapper.class);

    @Mapping(source = "usageInfo", target = "usageInfoDto")
    @Mapping(source = "address", target = "address", qualifiedByName = "addressToDto")
    GymDto toDto(Gym gym);

    @Named("addressToDto")
    default AddressDto addressToDto(Address address) {
        return AddressDto.fromEntity(address);
    }
}
