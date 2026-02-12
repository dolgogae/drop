package com.drop.domain.gymsync.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PlaceDetailsResponseDto {

    private Result result;
    private String status;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Result {

        @JsonProperty("formatted_phone_number")
        private String formattedPhoneNumber;

        private String website;
    }
}
