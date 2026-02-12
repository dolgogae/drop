package com.drop.domain.gymsync.controller;

import com.drop.domain.gymsync.config.GooglePlacesWebClientConfig;
import com.drop.domain.gymsync.dto.GymSyncExecutionResultDto;
import com.drop.domain.gymsync.dto.GymSyncSummaryDto;
import com.drop.domain.gymsync.dto.TextSearchResponseDto;
import com.drop.domain.gymsync.job.GymSyncTasklet;
import com.drop.global.code.result.ResultCode;
import com.drop.global.code.result.ResultResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Date;

@Slf4j
@RestController
@RequestMapping("/gymsync")
@RequiredArgsConstructor
public class GymSyncController {

    private final JobLauncher jobLauncher;
    private final Job gymSyncJob;
    private final GymSyncTasklet gymSyncTasklet;
    private final WebClient googlePlacesWebClient;
    private final GooglePlacesWebClientConfig googlePlacesWebClientConfig;

    @GetMapping("/test-api")
    public ResponseEntity<ResultResponse> testGooglePlacesApi() {
        try {
            log.info("Google Places API 테스트 요청");

            TextSearchResponseDto response = googlePlacesWebClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/textsearch/json")
                            .queryParam("query", "크로스핏 강남")
                            .queryParam("key", googlePlacesWebClientConfig.getApiKey())
                            .queryParam("language", "ko")
                            .build())
                    .retrieve()
                    .bodyToMono(TextSearchResponseDto.class)
                    .block();

            if (response == null) {
                return ResponseEntity.internalServerError()
                        .body(ResultResponse.of(ResultCode.GYM_SYNC_FAILED, "응답 없음"));
            }

            log.info("Google Places API 테스트 결과 - status: {}, 결과 수: {}",
                    response.getStatus(),
                    response.getResults() != null ? response.getResults().size() : 0);

            return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_SYNC_SUCCESS, response));

        } catch (Exception e) {
            log.error("Google Places API 테스트 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ResultResponse.of(ResultCode.GYM_SYNC_FAILED, e.getMessage()));
        }
    }

    @PostMapping("/execute")
    public ResponseEntity<ResultResponse> executeBatch() {
        try {
            log.info("수동 배치 실행 요청");

            JobParameters jobParameters = new JobParametersBuilder()
                    .addDate("executionDate", new Date())
                    .addString("executionType", "MANUAL")
                    .toJobParameters();

            jobLauncher.run(gymSyncJob, jobParameters);

            GymSyncExecutionResultDto result = gymSyncTasklet.getLastExecutionResult();
            if (result != null && "SUCCESS".equals(result.getStatus())) {
                GymSyncSummaryDto summary = GymSyncSummaryDto.builder()
                        .batchId(result.getBatchId())
                        .status(result.getStatus())
                        .durationSeconds(result.getDurationSeconds())
                        .totalRegions(result.getTotalRegions())
                        .totalApiCalls(result.getTotalApiCalls())
                        .finalCount(result.getFinalCount())
                        .outputFile(result.getOutputFile())
                        .build();

                return ResponseEntity.ok(ResultResponse.of(ResultCode.GYM_SYNC_SUCCESS, summary));
            } else {
                return ResponseEntity.internalServerError()
                        .body(ResultResponse.of(ResultCode.GYM_SYNC_FAILED, result));
            }

        } catch (Exception e) {
            log.error("배치 실행 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ResultResponse.of(ResultCode.GYM_SYNC_FAILED, e.getMessage()));
        }
    }

}
