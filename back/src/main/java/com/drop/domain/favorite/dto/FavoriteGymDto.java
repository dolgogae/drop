package com.drop.domain.favorite.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteGymDto {
    private Long gymId;
    private String name;
    private String location;
    private Boolean isFavorite;
}
