package com.drop.domain.fee.dto;

import com.drop.global.enums.FeeType;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class FeeCreateDto {
    private FeeType feeType;
    private Long trainerId;
    private Long gymId;
    private Long price;
    private Integer frequency;
}
