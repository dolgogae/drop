package com.drop.domain.crossfitbox.dto;

import com.drop.domain.base.AddressDto;
import com.drop.domain.auth.dto.UserDto;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@ToString
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class CrossfitBoxDto extends UserDto {

    private String name;
    private String phoneNumber;
    private String etcInfo;    // nearby any stations
    private Integer dropInFee;
    private AddressDto address;
    private Double latitude;
    private Double longitude;
    private CrossfitBoxUsageInfoDto usageInfo;


    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CrossfitBoxUsageInfoDto{
        private Boolean parking;
        private Boolean wear;
        private Boolean locker;
    }
}
