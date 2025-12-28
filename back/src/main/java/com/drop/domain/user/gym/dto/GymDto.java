package com.drop.domain.user.gym.dto;

import com.drop.domain.base.AddressDto;
import com.drop.domain.user.userbase.dto.UserDto;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@ToString
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class GymDto extends UserDto {

    private String name;
    private String phoneNumber;
    private String etcInfo;    // nearby any stations
    private AddressDto address;
    private Double latitude;
    private Double longitude;
    private GymUsageInfoDto usageInfoDto;


    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GymUsageInfoDto{
        private Boolean parking;
        private Boolean wear;
        private Boolean locker;
    }
}
