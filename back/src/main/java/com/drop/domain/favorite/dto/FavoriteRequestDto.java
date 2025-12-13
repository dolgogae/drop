package com.drop.domain.favorite.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteRequestDto {
    private Long gymId;
    private Boolean isFavorite;
}
