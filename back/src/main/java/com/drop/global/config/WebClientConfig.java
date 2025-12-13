package com.drop.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${kakao.api.base-url}")
    private String kakaoBaseUrl;

    @Value("${kakao.api.key}")
    private String kakaoApiKey;

    @Bean
    public WebClient kakaoWebClient() {
        return WebClient.builder()
                .baseUrl(kakaoBaseUrl)
                .defaultHeader("Authorization", "KakaoAK " + kakaoApiKey)
                .build();
    }
}
