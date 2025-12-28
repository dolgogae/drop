package com.drop.domain.base;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "주소 DTO")
public class AddressDto {

    @Schema(description = "국가 코드", example = "KR")
    @Builder.Default
    private String countryCode = "KR";

    @Schema(description = "우편번호", example = "06236")
    @NotBlank(message = "우편번호는 필수입니다")
    @Size(min = 3, max = 10, message = "우편번호는 3~10자 사이여야 합니다")
    private String postalCode;

    @Schema(description = "기본 주소 (도로명 주소)", example = "서울특별시 강남구 테헤란로 123")
    @NotBlank(message = "기본 주소는 필수입니다")
    @Size(min = 5, max = 200, message = "기본 주소는 5~200자 사이여야 합니다")
    private String addressLine1;

    @Schema(description = "상세 주소", example = "101동 202호")
    @Size(max = 200, message = "상세 주소는 200자 이하여야 합니다")
    private String addressLine2;

    @Schema(description = "지번 주소", example = "서울특별시 강남구 역삼동 123-45")
    private String jibunAddress;

    @Schema(description = "건물명", example = "테헤란빌딩")
    private String buildingName;

    @Schema(description = "주소 입력 소스")
    private Address.AddressSource addressSource;

    public static AddressDto fromEntity(Address address) {
        if (address == null) {
            return null;
        }
        return AddressDto.builder()
                .countryCode(address.getCountryCode())
                .postalCode(address.getPostalCode())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .jibunAddress(address.getJibunAddress())
                .buildingName(address.getBuildingName())
                .addressSource(address.getAddressSource())
                .build();
    }
}
