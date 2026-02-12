package com.drop.domain.gymsync.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class TextSearchResponseDto {

    private List<Result> results;
    private String status;

    @JsonProperty("next_page_token")
    private String nextPageToken;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Result {

        @JsonProperty("place_id")
        private String placeId;

        private String name;

        @JsonProperty("formatted_address")
        private String formattedAddress;

        private Geometry geometry;
        private Double rating;

        @JsonProperty("user_ratings_total")
        private Integer userRatingsTotal;

        private List<String> types;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Geometry {
        private Location location;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Location {
        private Double lat;
        private Double lng;
    }
}
