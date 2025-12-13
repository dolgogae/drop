package com.drop.domain.membergym.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MemberGymRequestDto {
    private Long gymId;
    private Boolean isFavorite;
}
