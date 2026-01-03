package com.drop.domain.membercrossfitbox.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberCrossfitBoxDto {
    private Long crossfitBoxId;
    private String name;
    private String location;
    private Boolean isFavorite;
}
