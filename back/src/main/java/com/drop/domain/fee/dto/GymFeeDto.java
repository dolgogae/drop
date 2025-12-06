package com.drop.domain.fee.dto;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class GymFeeDto {
    private Long id;
    private Long gymId;
    private Long price;
    private Integer frequency;
}
