package com.drop.domain.fee.dto;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CrossfitBoxFeeDto {
    private Long id;
    private Long crossfitBoxId;
    private Long price;
    private Integer frequency;
}
