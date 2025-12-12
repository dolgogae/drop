package com.drop.domain.place.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PlaceDto {
    private String kakaoPlaceId;
    private String name;
    private Double latitude;
    private Double longitude;
    private String address;
    private String roadAddress;
    private String phone;
    private String category;
    private String placeUrl;

    public static PlaceDto from(KakaoPlaceResponseDto.Document document) {
        return PlaceDto.builder()
                .kakaoPlaceId(document.getId())
                .name(document.getPlaceName())
                .latitude(Double.parseDouble(document.getY()))
                .longitude(Double.parseDouble(document.getX()))
                .address(document.getAddressName())
                .roadAddress(document.getRoadAddressName())
                .phone(document.getPhone())
                .category(document.getCategoryName())
                .placeUrl(document.getPlaceUrl())
                .build();
    }
}
