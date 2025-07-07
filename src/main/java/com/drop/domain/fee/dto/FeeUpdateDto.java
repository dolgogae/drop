package com.drop.domain.fee.dto;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class FeeUpdateDto {
    private Long FeeId;
    private Long price;
    private Integer frequency;
}
