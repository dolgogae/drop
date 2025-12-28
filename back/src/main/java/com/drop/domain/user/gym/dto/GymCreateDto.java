package com.drop.domain.user.gym.dto;

import com.drop.domain.base.AddressDto;
import com.drop.domain.user.userbase.dto.UserCreateDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.SuperBuilder;

import javax.validation.Valid;
import javax.validation.constraints.Pattern;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Schema(description = "체육관 생성 DTO")
public class GymCreateDto extends UserCreateDto {
    private String name;

    @Pattern(regexp = "^0\\d{2}-\\d{3,4}-\\d{4}$", message = "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)")
    @Schema(description = "전화번호 (xxx-xxxx-xxxx 형식)", example = "010-1234-5678")
    private String phoneNumber;

    private String etcInfo;    // nearby any stations

    @Valid
    @Schema(description = "주소 정보")
    private AddressDto address;

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
