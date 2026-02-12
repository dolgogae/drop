package com.drop.domain.gymsync.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "batch")
public class GymSyncProperties {

    private AutoSubdivision autoSubdivision = new AutoSubdivision();
    private DetailsApi detailsApi = new DetailsApi();
    private Schedule schedule = new Schedule();

    @Getter
    @Setter
    public static class AutoSubdivision {
        private boolean enabled = true;
        private int threshold = 55;
    }

    @Getter
    @Setter
    public static class DetailsApi {
        private boolean enabled = true;
        private String fields = "formatted_phone_number,website";
    }

    @Getter
    @Setter
    public static class Schedule {
        private boolean enabled = false;
        private String cron = "0 0 3 1 * ?";
        private String timezone = "Asia/Seoul";
    }
}
