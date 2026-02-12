package com.drop.domain.gymsync.service;

import com.drop.domain.gymsync.config.GooglePlacesWebClientConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleTranslateService {

    private static final String TRANSLATE_BASE_URL = "https://translation.googleapis.com";

    private final GooglePlacesWebClientConfig googlePlacesWebClientConfig;

    /**
     * 한글 이름을 영문으로 번역 후 username 형식으로 변환
     * 예: "크로스핏 강남" → "crossfit-gangnam"
     */
    public String translateToUsername(String koreanName) {
        try {
            String translated = callTranslateApi(koreanName);
            return formatAsUsername(translated);
        } catch (Exception e) {
            log.error("번역 실패 - name: {}, error: {}", koreanName, e.getMessage());
            return formatAsUsername(koreanName);
        }
    }

    @SuppressWarnings("unchecked")
    private String callTranslateApi(String text) {
        WebClient translateClient = WebClient.builder()
                .baseUrl(TRANSLATE_BASE_URL)
                .build();

        Map<String, Object> response = translateClient.get()
                .uri(uriBuilder -> uriBuilder.path("/language/translate/v2")
                        .queryParam("q", text)
                        .queryParam("source", "ko")
                        .queryParam("target", "en")
                        .queryParam("key", googlePlacesWebClientConfig.getApiKey())
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null) {
            throw new RuntimeException("Translation API 응답 없음");
        }

        Map<String, Object> data = (Map<String, Object>) response.get("data");
        List<Map<String, Object>> translations = (List<Map<String, Object>>) data.get("translations");
        String translatedText = (String) translations.get(0).get("translatedText");

        log.debug("번역 결과 - '{}' → '{}'", text, translatedText);
        return translatedText;
    }

    private String formatAsUsername(String text) {
        return text.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-");
    }
}
