package com.drop.domain.geocoding.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AddressValidationResponseDto {
    private boolean valid;
    private String address;
    private String roadAddress;
    private Double latitude;
    private Double longitude;
    private String message;

    public static AddressValidationResponseDto valid(
            String address, String roadAddress, Double latitude, Double longitude) {
        return AddressValidationResponseDto.builder()
                .valid(true)
                .address(address)
                .roadAddress(roadAddress)
                .latitude(latitude)
                .longitude(longitude)
                .message("유효한 주소입니다.")
                .build();
    }

    public static AddressValidationResponseDto invalid(String query) {
        return AddressValidationResponseDto.builder()
                .valid(false)
                .address(query)
                .message("유효하지 않은 주소입니다.")
                .build();
    }
}
