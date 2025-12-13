package com.drop.domain.membergym.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberGymPreviewDto {
    private Long gymId;
    private String name;
    private Boolean isFavorite;
    private Boolean isDeleted;
}
