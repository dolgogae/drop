package com.drop.domain.place.dto;

import com.drop.domain.place.data.RegisteredGym;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class RegisteredGymDto {
    private Long id;
    private String kakaoPlaceId;
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static RegisteredGymDto from(RegisteredGym gym) {
        return RegisteredGymDto.builder()
                .id(gym.getId())
                .kakaoPlaceId(gym.getKakaoPlaceId())
                .displayName(gym.getDisplayName())
                .address(gym.getAddress())
                .roadAddress(gym.getRoadAddress())
                .phone(gym.getPhone())
                .latitude(gym.getLatitude())
                .longitude(gym.getLongitude())
                .placeUrl(gym.getPlaceUrl())
                .note(gym.getNote())
                .tags(gym.getTags())
                .isFavorite(gym.getIsFavorite())
                .createdAt(gym.getCreatedAt())
                .updatedAt(gym.getUpdatedAt())
                .build();
    }
}
