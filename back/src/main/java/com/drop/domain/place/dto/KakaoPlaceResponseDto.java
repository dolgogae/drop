package com.drop.domain.place.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class KakaoPlaceResponseDto {

    private List<Document> documents;
    private Meta meta;

    @Getter
    @NoArgsConstructor
    public static class Document {
        private String id;
        @JsonProperty("place_name")
        private String placeName;
        @JsonProperty("category_name")
        private String categoryName;
        @JsonProperty("category_group_code")
        private String categoryGroupCode;
        @JsonProperty("category_group_name")
        private String categoryGroupName;
        private String phone;
        @JsonProperty("address_name")
        private String addressName;
        @JsonProperty("road_address_name")
        private String roadAddressName;
        private String x; // longitude
        private String y; // latitude
        @JsonProperty("place_url")
        private String placeUrl;
        private String distance;
    }

    @Getter
    @NoArgsConstructor
    public static class Meta {
        @JsonProperty("total_count")
        private Integer totalCount;
        @JsonProperty("pageable_count")
        private Integer pageableCount;
        @JsonProperty("is_end")
        private Boolean isEnd;
        @JsonProperty("same_name")
        private SameName sameName;
    }

    @Getter
    @NoArgsConstructor
    public static class SameName {
        private List<String> region;
        private String keyword;
        @JsonProperty("selected_region")
        private String selectedRegion;
    }
}
