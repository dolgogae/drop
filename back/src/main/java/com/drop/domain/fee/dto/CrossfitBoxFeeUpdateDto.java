package com.drop.domain.fee.dto;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class CrossfitBoxFeeUpdateDto {
    private Long FeeId;
    private Long price;
    private Integer frequency;
}
