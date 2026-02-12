package com.drop.domain.gymsync.job;

import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class GymSyncJobConfig {

    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
    private final GymSyncTasklet gymSyncTasklet;

    @Bean
    public Job gymSyncJob() {
        return jobBuilderFactory.get("gymSyncJob")
                .incrementer(new RunIdIncrementer())
                .start(crossfitGymCollectionStep())
                .build();
    }

    @Bean
    public Step crossfitGymCollectionStep() {
        return stepBuilderFactory.get("crossfitGymCollectionStep")
                .tasklet(gymSyncTasklet)
                .build();
    }
}
