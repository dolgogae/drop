package com.drop.domain.fee.dto;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class FeeDto {
    private Long trainerId;
    private Long price;
    private Integer frequency;
}
