package com.drop.domain.place.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Getter
@NoArgsConstructor
public class GymRegisterRequestDto {

    @NotBlank(message = "카카오 장소 ID는 필수입니다.")
    private String kakaoPlaceId;

    @NotBlank(message = "장소명은 필수입니다.")
    private String displayName;

    private String address;
    private String roadAddress;
    private String phone;
    private Double latitude;
    private Double longitude;
    private String placeUrl;
    private String note;
    private String tags;
    private Boolean isFavorite;
}
