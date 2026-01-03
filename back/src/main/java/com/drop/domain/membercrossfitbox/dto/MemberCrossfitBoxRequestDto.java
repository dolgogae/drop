package com.drop.domain.membercrossfitbox.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MemberCrossfitBoxRequestDto {
    private Long crossfitBoxId;
    private Boolean isFavorite;
}
