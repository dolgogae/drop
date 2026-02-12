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
public class FilterRuleConfig {

    private List<String> includeKeywords = Collections.emptyList();
    private List<String> excludeKeywords = Collections.emptyList();
    private List<String> excludeGoogleTypes = Collections.emptyList();
    private List<String> cfKeywords = Collections.emptyList();
    private List<String> gymKeywords = Collections.emptyList();
    private double similarityThreshold = 0.9;

    @PostConstruct
    public void init() {
        try {
            Yaml yaml = new Yaml();
            InputStream inputStream = new ClassPathResource("config/filter-rules.yml").getInputStream();
            Map<String, Object> root = yaml.load(inputStream);

            @SuppressWarnings("unchecked")
            Map<String, Object> filterRules = (Map<String, Object>) root.get("filterRules");
            if (filterRules == null) return;

            // Include rules
            @SuppressWarnings("unchecked")
            Map<String, Object> include = (Map<String, Object>) filterRules.get("include");
            if (include != null) {
                @SuppressWarnings("unchecked")
                List<String> keywords = (List<String>) include.get("keywords");
                if (keywords != null) this.includeKeywords = keywords;

                @SuppressWarnings("unchecked")
                Map<String, Object> combined = (Map<String, Object>) include.get("combinedKeywords");
                if (combined != null) {
                    @SuppressWarnings("unchecked")
                    List<String> cf = (List<String>) combined.get("cfKeywords");
                    if (cf != null) this.cfKeywords = cf;

                    @SuppressWarnings("unchecked")
                    List<String> gym = (List<String>) combined.get("gymKeywords");
                    if (gym != null) this.gymKeywords = gym;
                }
            }

            // Exclude rules
            @SuppressWarnings("unchecked")
            Map<String, Object> exclude = (Map<String, Object>) filterRules.get("exclude");
            if (exclude != null) {
                @SuppressWarnings("unchecked")
                List<String> exKw = (List<String>) exclude.get("keywords");
                if (exKw != null) this.excludeKeywords = exKw;

                @SuppressWarnings("unchecked")
                List<String> exTypes = (List<String>) exclude.get("googleTypes");
                if (exTypes != null) this.excludeGoogleTypes = exTypes;
            }

            // Deduplication
            @SuppressWarnings("unchecked")
            Map<String, Object> dedup = (Map<String, Object>) filterRules.get("deduplication");
            if (dedup != null && dedup.get("similarityThreshold") != null) {
                this.similarityThreshold = ((Number) dedup.get("similarityThreshold")).doubleValue();
            }

            log.info("필터 규칙 로드 완료 - 포함 키워드: {}개, 제외 키워드: {}개, 제외 타입: {}개",
                    includeKeywords.size(), excludeKeywords.size(), excludeGoogleTypes.size());
        } catch (Exception e) {
            log.error("filter-rules.yml 로드 실패", e);
        }
    }
}
