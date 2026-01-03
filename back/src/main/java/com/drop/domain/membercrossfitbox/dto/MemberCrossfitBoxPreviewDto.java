package com.drop.domain.membercrossfitbox.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberCrossfitBoxPreviewDto {
    private Long crossfitBoxId;
    private String name;
    private Boolean isFavorite;
    private Boolean isDeleted;
}
