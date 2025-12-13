package com.drop.domain.home.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyGymPreviewDto {
    private Long gymId;
    private String name;
    private Boolean isFavorite;
}
