package com.drop.domain.fee.dto;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class GymFeeCreateDto {
    private String token;
    private Long price;
    private Integer frequency;
}
