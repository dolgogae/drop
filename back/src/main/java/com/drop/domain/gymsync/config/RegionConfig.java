package com.drop.domain.gymsync.config;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;

import javax.annotation.PostConstruct;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@Getter
public class RegionConfig {

    private List<Map<String, Object>> level1Regions = Collections.emptyList();
    private List<Map<String, Object>> level2Regions = Collections.emptyList();

    @PostConstruct
    public void init() {
        try {
            Yaml yaml = new Yaml();
            InputStream inputStream = new ClassPathResource("config/regions.yml").getInputStream();
            Map<String, Object> root = yaml.load(inputStream);

            @SuppressWarnings("unchecked")
            Map<String, Object> regions = (Map<String, Object>) root.get("regions");
            if (regions != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> l1 = (List<Map<String, Object>>) regions.get("level1");
                if (l1 != null) {
                    this.level1Regions = l1;
                }

                @SuppressWarnings("unchecked")
                List<Map<String, Object>> l2 = (List<Map<String, Object>>) regions.get("level2");
                if (l2 != null) {
                    this.level2Regions = l2;
                }
            }

            log.info("지역 설정 로드 완료 - Level1: {}개, Level2: {}개",
                    level1Regions.size(), level2Regions.size());
        } catch (Exception e) {
            log.error("regions.yml 로드 실패", e);
        }
    }
}
