package com.drop.domain.user.gym.dto;

import com.drop.domain.user.userbase.dto.UserCreateDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Schema(description = "체육관 생성 DTO")
public class GymCreateDto extends UserCreateDto {
    // TODO: need to add gym's column
    private String location;
    private String phoneNumber;
    private String etcInfo;    // nearby any stations
    private GymUsageInfoDto usageInfoDto;


    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GymUsageInfoDto{
        private Boolean parking;
        private Boolean wear;
        private Boolean locker;
    }
}
