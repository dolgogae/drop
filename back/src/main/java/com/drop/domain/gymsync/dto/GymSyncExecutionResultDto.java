package com.drop.domain.gymsync.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GymSyncExecutionResultDto {

    private String batchId;
    private String executionType;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private long durationSeconds;
    private String status;

    private int totalRegions;
    private int totalApiCalls;
    private int rawResultsCount;
    private int filteredCount;
    private int duplicatesRemoved;
    private int finalCount;

    private String outputFile;
    private String reportFile;

    @Builder.Default
    private List<String> errors = new ArrayList<>();
}
