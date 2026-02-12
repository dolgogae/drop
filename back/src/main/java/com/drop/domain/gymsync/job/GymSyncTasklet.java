package com.drop.domain.gymsync.job;

import com.drop.domain.gymsync.config.GymSyncProperties;
import com.drop.domain.gymsync.dto.GymSyncExecutionResultDto;
import com.drop.domain.gymsync.dto.FilterStatsDto;
import com.drop.domain.gymsync.dto.PlaceDto;
import com.drop.domain.gymsync.service.GymSyncReportService;
import com.drop.domain.gymsync.service.CrossfitBoxAccountService;
import com.drop.domain.gymsync.service.GooglePlacesApiService;
import com.drop.domain.gymsync.service.PlaceFilterService;
import com.drop.domain.gymsync.service.RegionSearchService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class GymSyncTasklet implements Tasklet {

    private final RegionSearchService regionSearchService;
    private final PlaceFilterService placeFilterService;
    private final GooglePlacesApiService googlePlacesApiService;
    private final GymSyncReportService batchReportService;
    private final GymSyncProperties batchProperties;
    private final CrossfitBoxAccountService crossfitBoxAccountService;

    @Getter
    private GymSyncExecutionResultDto lastExecutionResult;

    @Override
    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) {
        String batchId = UUID.randomUUID().toString();
        LocalDateTime startedAt = LocalDateTime.now();
        String executionType = "SCHEDULED";

        // ExecutionContext에서 실행 타입 확인
        if (chunkContext.getStepContext().getStepExecution().getJobExecution()
                .getJobParameters().getString("executionType") != null) {
            executionType = chunkContext.getStepContext().getStepExecution().getJobExecution()
                    .getJobParameters().getString("executionType");
        }

        log.info("========================================");
        log.info("크로스핏 체육관 수집 배치 시작");
        log.info("Batch ID: {}", batchId);
        log.info("Execution Type: {}", executionType);
        log.info("========================================");

        GymSyncExecutionResultDto result = GymSyncExecutionResultDto.builder()
                .batchId(batchId)
                .executionType(executionType)
                .startedAt(startedAt)
                .build();

        FilterStatsDto filterStats = null;

        try {
            // Step 1: 전체 지역 검색
            googlePlacesApiService.resetApiCallCount();
            log.info("[Step 1/5] 전체 지역 검색 시작");
            List<PlaceDto> rawResults = regionSearchService.searchAllRegions();
            result.setRawResultsCount(rawResults.size());
            result.setTotalRegions(regionSearchService.getTotalRegionCount());
            log.info("[Step 1/5] 전체 지역 검색 완료 - 원본 결과: {}건", rawResults.size());

            // Step 2: 필터링 + 중복 제거
            log.info("[Step 2/5] 필터링 및 중복 제거 시작");
            PlaceFilterService.FilterResult filterResult = placeFilterService.filter(rawResults);
            List<PlaceDto> filteredPlaces = filterResult.getPlaces();
            filterStats = filterResult.getStats();
            result.setFilteredCount(filteredPlaces.size());
            result.setDuplicatesRemoved(filterStats.getDuplicatesRemoved());
            log.info("[Step 2/5] 필터링 완료 - 필터링 후: {}건", filteredPlaces.size());

            // Step 3: Details API 보강
            if (batchProperties.getDetailsApi().isEnabled()) {
                log.info("[Step 3/5] Details API 보강 시작 - {}건", filteredPlaces.size());
                int detailsCount = 0;
                for (PlaceDto place : filteredPlaces) {
                    googlePlacesApiService.enrichWithDetails(place);
                    detailsCount++;
                    if (detailsCount % 50 == 0) {
                        log.info("[Step 3/5] Details API 진행: {}/{}건", detailsCount, filteredPlaces.size());
                    }
                }
                log.info("[Step 3/5] Details API 보강 완료 - {}건", detailsCount);
            } else {
                log.info("[Step 3/5] Details API 비활성화 - skip");
            }

            // Step 4: CrossfitBox 동기화 (신규 생성 + 영업종료 후보 감지)
            result.setFinalCount(filteredPlaces.size());
            log.info("[Step 4/5] CrossfitBox 동기화 시작 - {}건", filteredPlaces.size());
            Map<String, Object> accountResult = crossfitBoxAccountService.syncWithPlaces(filteredPlaces);
            log.info("[Step 4/5] CrossfitBox 동기화 완료 - created: {}, skipped: {}, inactive: {}, failed: {}",
                    accountResult.get("created"), accountResult.get("skipped"),
                    accountResult.get("inactive"), accountResult.get("failed"));

            // Step 5: 리포트 생성
            result.setTotalApiCalls(googlePlacesApiService.getApiCallCount());
            LocalDateTime finishedAt = LocalDateTime.now();
            result.setFinishedAt(finishedAt);
            result.setDurationSeconds(Duration.between(startedAt, finishedAt).getSeconds());
            result.setStatus("SUCCESS");

            log.info("[Step 5/5] 리포트 생성 시작");
            String reportPath = batchReportService.generateReport(result, filterStats);
            result.setReportFile(reportPath);
            log.info("[Step 5/5] 리포트 생성 완료 - {}", reportPath);

        } catch (Exception e) {
            log.error("배치 실행 중 오류 발생", e);
            result.setStatus("FAILED");
            result.getErrors().add(e.getMessage());
            result.setFinishedAt(LocalDateTime.now());
            result.setDurationSeconds(Duration.between(startedAt, LocalDateTime.now()).getSeconds());
            result.setTotalApiCalls(googlePlacesApiService.getApiCallCount());

            // 부분 실패시 리포트 생성
            try {
                String reportPath = batchReportService.generateReport(result, filterStats);
                result.setReportFile(reportPath);
            } catch (Exception re) {
                log.error("실패 리포트 생성 중 추가 오류", re);
            }
        }

        this.lastExecutionResult = result;

        log.info("========================================");
        log.info("크로스핏 체육관 수집 배치 종료");
        log.info("Status: {}", result.getStatus());
        log.info("Duration: {}분 {}초", result.getDurationSeconds() / 60, result.getDurationSeconds() % 60);
        log.info("Final Count: {}건", result.getFinalCount());
        log.info("========================================");

        return RepeatStatus.FINISHED;
    }
}
