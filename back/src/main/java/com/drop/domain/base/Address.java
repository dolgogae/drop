package com.drop.domain.base;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Column(length = 2)
    @Builder.Default
    private String countryCode = "KR";

    @Column(length = 10)
    private String postalCode;

    @Column(length = 200)
    private String addressLine1;

    @Column(length = 200)
    private String addressLine2;

    @Column(length = 200)
    private String jibunAddress;

    @Column(length = 100)
    private String buildingName;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AddressSource addressSource;

    public enum AddressSource {
        DAUM_POSTCODE,
        MANUAL
    }

    public static Address create(AddressDto dto) {
        if (dto == null) {
            return null;
        }
        return Address.builder()
                .countryCode(dto.getCountryCode() != null ? dto.getCountryCode() : "KR")
                .postalCode(trimOrNull(dto.getPostalCode()))
                .addressLine1(trimOrNull(dto.getAddressLine1()))
                .addressLine2(trimOrNull(dto.getAddressLine2()))
                .jibunAddress(trimOrNull(dto.getJibunAddress()))
                .buildingName(trimOrNull(dto.getBuildingName()))
                .addressSource(dto.getAddressSource() != null ? dto.getAddressSource() : AddressSource.MANUAL)
                .build();
    }

    private static String trimOrNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
