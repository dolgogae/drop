package com.drop.domain.gymsync.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterStatsDto {

    private int totalInput;
    private int includedByKeyword;
    private int excludedByKeyword;
    private int excludedByType;
    private int duplicatesRemoved;
    private int finalOutput;
}
