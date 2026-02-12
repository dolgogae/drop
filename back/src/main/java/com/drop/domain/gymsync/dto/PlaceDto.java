package com.drop.domain.gymsync.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceDto {

    private String placeId;
    private String name;
    private String formattedAddress;
    private String phoneNumber;
    private Double latitude;
    private Double longitude;
    private Double rating;
    private Integer userRatingsTotal;
    private String website;
    private List<String> types;
    private String region;
    private LocalDateTime collectedAt;

    public String getTypesAsString() {
        if (types == null || types.isEmpty()) {
            return "";
        }
        return String.join(",", types);
    }
}
