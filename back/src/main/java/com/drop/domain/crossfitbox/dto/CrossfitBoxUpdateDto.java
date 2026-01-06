package com.drop.domain.crossfitbox.dto;

import com.drop.domain.base.AddressDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import javax.validation.Valid;
import javax.validation.constraints.Pattern;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "크로스핏박스 수정 DTO")
public class CrossfitBoxUpdateDto {

    @Schema(description = "박스명", example = "크로스핏 강남")
    private String name;

    @Pattern(regexp = "^0\\d{2}-\\d{3,4}-\\d{4}$", message = "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)")
    @Schema(description = "전화번호 (xxx-xxxx-xxxx 형식)", example = "010-1234-5678")
    private String phoneNumber;

    @Schema(description = "기타 정보 (가까운 역 등)", example = "강남역 2번 출구 도보 5분")
    private String etcInfo;

    @Schema(description = "드랍인 비용 (원)", example = "30000")
    private Integer dropInFee;

    @Valid
    @Schema(description = "주소 정보")
    private AddressDto address;

    @Schema(description = "시설 정보")
    private UsageInfoDto usageInfo;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "시설 정보 DTO")
    public static class UsageInfoDto {
        @Schema(description = "주차 가능 여부")
        private Boolean parking;

        @Schema(description = "운동복 대여 가능 여부")
        private Boolean wear;

        @Schema(description = "개인 락커 이용 가능 여부")
        private Boolean locker;
    }
}
