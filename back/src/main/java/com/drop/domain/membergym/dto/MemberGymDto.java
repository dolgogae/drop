package com.drop.domain.membergym.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberGymDto {
    private Long gymId;
    private String name;
    private String location;
    private Boolean isFavorite;
}
