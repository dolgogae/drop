package com.drop.domain.geocoding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class KakaoGeocodingResponseDto {

    private List<Document> documents;
    private Meta meta;

    @Getter
    @NoArgsConstructor
    public static class Document {
        @JsonProperty("address_name")
        private String addressName;
        private String x; // longitude
        private String y; // latitude
        @JsonProperty("address_type")
        private String addressType;
        private Address address;
        @JsonProperty("road_address")
        private RoadAddress roadAddress;
    }

    @Getter
    @NoArgsConstructor
    public static class Address {
        @JsonProperty("address_name")
        private String addressName;
        @JsonProperty("region_1depth_name")
        private String region1DepthName;
        @JsonProperty("region_2depth_name")
        private String region2DepthName;
        @JsonProperty("region_3depth_name")
        private String region3DepthName;
    }

    @Getter
    @NoArgsConstructor
    public static class RoadAddress {
        @JsonProperty("address_name")
        private String addressName;
        @JsonProperty("road_name")
        private String roadName;
        @JsonProperty("building_name")
        private String buildingName;
    }

    @Getter
    @NoArgsConstructor
    public static class Meta {
        @JsonProperty("total_count")
        private Integer totalCount;
    }
}
