package com.drop.domain.gymsync.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "batch.schedule.enabled", havingValue = "true")
public class GymSyncScheduler {

    private final JobLauncher jobLauncher;
    private final Job gymSyncJob;

    @Scheduled(cron = "${batch.schedule.cron:0 0 3 1 * ?}", zone = "${batch.schedule.timezone:Asia/Seoul}")
    public void runMonthlyBatch() {
        log.info("월간 크로스핏 체육관 수집 배치 스케줄 실행");

        try {
            JobParameters jobParameters = new JobParametersBuilder()
                    .addDate("executionDate", new Date())
                    .addString("executionType", "SCHEDULED")
                    .toJobParameters();

            jobLauncher.run(gymSyncJob, jobParameters);

            log.info("월간 배치 스케줄 실행 완료");

        } catch (Exception e) {
            log.error("월간 배치 스케줄 실행 실패", e);
        }
    }
}
