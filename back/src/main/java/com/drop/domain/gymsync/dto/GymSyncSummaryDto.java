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
public class GymSyncSummaryDto {

    private String batchId;
    private String status;
    private long durationSeconds;
    private int totalRegions;
    private int totalApiCalls;
    private int finalCount;
    private String outputFile;
}
