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
        String formatted = text.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-");

        // 한글 등 비영문 이름 번역 실패 시 빈 문자열 방지 → 로마자 변환 fallback
        if (formatted.isEmpty()) {
            formatted = romanize(text);
        }

        return formatted;
    }

    /**
     * 한글 이름을 간단한 로마자로 변환 (번역 API 실패 시 fallback)
     * 초성/중성/종성 분리 후 로마자 매핑
     */
    private String romanize(String korean) {
        String[] initials = {"g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"};
        String[] medials = {"a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"};
        String[] finals = {"", "g", "kk", "gs", "n", "nj", "nh", "d", "l", "lg", "lm", "lb", "ls", "lt", "lp", "lh", "m", "b", "bs", "s", "ss", "ng", "j", "ch", "k", "t", "p", "h"};

        StringBuilder sb = new StringBuilder();
        for (char c : korean.toCharArray()) {
            if (c >= 0xAC00 && c <= 0xD7A3) {
                int code = c - 0xAC00;
                int initialIdx = code / (21 * 28);
                int medialIdx = (code % (21 * 28)) / 28;
                int finalIdx = code % 28;
                sb.append(initials[initialIdx]).append(medials[medialIdx]).append(finals[finalIdx]);
            } else if (Character.isLetterOrDigit(c)) {
                sb.append(Character.toLowerCase(c));
            } else if (c == ' ') {
                sb.append('-');
            }
        }

        String result = sb.toString().replaceAll("-+", "-").replaceAll("^-|-$", "");
        return result.isEmpty() ? "unknown-box" : result;
    }
}
