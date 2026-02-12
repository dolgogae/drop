package com.drop.domain.gymsync.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

import javax.annotation.PostConstruct;

@Slf4j
@Configuration
public class GooglePlacesWebClientConfig {

    @Value("${google.places.base-url}")
    private String baseUrl;

    @Value("${google.places.api-key}")
    private String apiKey;

    @PostConstruct
    public void logGooglePlacesConfig() {
        String maskedKey = apiKey != null && apiKey.length() > 8
                ? apiKey.substring(0, 4) + "****" + apiKey.substring(apiKey.length() - 4)
                : "NULL or TOO SHORT";
        log.info("Google Places API Config - baseUrl: {}, key: {}", baseUrl, maskedKey);
    }

    @Bean
    public WebClient googlePlacesWebClient() {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public String getApiKey() {
        return apiKey;
    }
}
