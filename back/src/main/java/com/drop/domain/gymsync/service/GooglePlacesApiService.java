package com.drop.domain.gymsync.service;

import com.drop.domain.gymsync.config.GooglePlacesWebClientConfig;
import com.drop.domain.gymsync.dto.PlaceDetailsResponseDto;
import com.drop.domain.gymsync.dto.PlaceDto;
import com.drop.domain.gymsync.dto.TextSearchResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class GooglePlacesApiService {

    private final WebClient googlePlacesWebClient;
    private final GooglePlacesWebClientConfig googlePlacesWebClientConfig;

    private final AtomicInteger apiCallCount = new AtomicInteger(0);

    private static final int MAX_PAGES = 3;
    private static final long PAGE_DELAY_MS = 2000;
    private static final long REQUEST_DELAY_MS = 2000;
    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_RETRY_DELAY_MS = 1000;

    public List<PlaceDto> textSearch(String query, String region) {
        List<PlaceDto> allResults = new ArrayList<>();
        String pageToken = null;

        for (int page = 0; page < MAX_PAGES; page++) {
            TextSearchResponseDto response = executeTextSearchWithRetry(query, pageToken);
            if (response == null || response.getResults() == null) {
                break;
            }

            for (TextSearchResponseDto.Result result : response.getResults()) {
                PlaceDto place = mapToPlaceDto(result, region);
                allResults.add(place);
            }

            log.debug("Text Search 페이지 {} 완료 - 쿼리: {}, 결과: {}건",
                    page + 1, query, response.getResults().size());

            pageToken = response.getNextPageToken();
            if (pageToken == null || pageToken.isEmpty()) {
                break;
            }

            // 다음 페이지 요청 전 대기 (Google 권장)
            sleep(PAGE_DELAY_MS);
        }

        log.info("Text Search 완료 - 쿼리: {}, 총 결과: {}건", query, allResults.size());
        return allResults;
    }

    public void enrichWithDetails(PlaceDto place) {
        PlaceDetailsResponseDto response = executeDetailsWithRetry(place.getPlaceId());
        if (response == null || response.getResult() == null) {
            return;
        }

        PlaceDetailsResponseDto.Result details = response.getResult();
        if (details.getFormattedPhoneNumber() != null) {
            place.setPhoneNumber(details.getFormattedPhoneNumber());
        }
        if (details.getWebsite() != null) {
            place.setWebsite(details.getWebsite());
        }

        log.debug("Place Details 보강 완료 - placeId: {}", place.getPlaceId());
    }

    public int getApiCallCount() {
        return apiCallCount.get();
    }

    public void resetApiCallCount() {
        apiCallCount.set(0);
    }

    private TextSearchResponseDto executeTextSearchWithRetry(String query, String pageToken) {
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                // 요청 간 대기
                sleep(REQUEST_DELAY_MS);

                TextSearchResponseDto response = googlePlacesWebClient.get()
                        .uri(uriBuilder -> {
                            uriBuilder.path("/textsearch/json")
                                    .queryParam("query", query)
                                    .queryParam("key", googlePlacesWebClientConfig.getApiKey())
                                    .queryParam("language", "ko");
                            if (pageToken != null) {
                                uriBuilder.queryParam("pagetoken", pageToken);
                            }
                            return uriBuilder.build();
                        })
                        .retrieve()
                        .bodyToMono(TextSearchResponseDto.class)
                        .block();

                apiCallCount.incrementAndGet();

                if (response != null && "OVER_QUERY_LIMIT".equals(response.getStatus())) {
                    log.warn("API 쿼리 한도 초과 - 대기 후 재시도 (시도 {}/{})", attempt, MAX_RETRIES);
                    sleep(INITIAL_RETRY_DELAY_MS * (long) Math.pow(2, attempt - 1));
                    continue;
                }

                if (response != null && "INVALID_REQUEST".equals(response.getStatus())) {
                    log.warn("잘못된 요청 - 쿼리: {}, skip", query);
                    return null;
                }

                if (response != null && "ZERO_RESULTS".equals(response.getStatus())) {
                    log.debug("검색 결과 없음 - 쿼리: {}", query);
                    return response;
                }

                return response;

            } catch (WebClientResponseException e) {
                log.warn("Text Search API 호출 실패 (시도 {}/{}) - 쿼리: {}, 상태: {}",
                        attempt, MAX_RETRIES, query, e.getStatusCode());
                if (attempt < MAX_RETRIES) {
                    sleep(INITIAL_RETRY_DELAY_MS * (long) Math.pow(2, attempt - 1));
                }
            } catch (Exception e) {
                log.error("Text Search API 예외 발생 (시도 {}/{}) - 쿼리: {}, 에러: {}",
                        attempt, MAX_RETRIES, query, e.getMessage());
                if (attempt < MAX_RETRIES) {
                    sleep(INITIAL_RETRY_DELAY_MS * (long) Math.pow(2, attempt - 1));
                }
            }
        }

        log.error("Text Search API 최종 실패 - 쿼리: {}", query);
        return null;
    }

    private PlaceDetailsResponseDto executeDetailsWithRetry(String placeId) {
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                sleep(REQUEST_DELAY_MS);

                PlaceDetailsResponseDto response = googlePlacesWebClient.get()
                        .uri(uriBuilder -> uriBuilder.path("/details/json")
                                .queryParam("place_id", placeId)
                                .queryParam("fields", "formatted_phone_number,website")
                                .queryParam("key", googlePlacesWebClientConfig.getApiKey())
                                .build())
                        .retrieve()
                        .bodyToMono(PlaceDetailsResponseDto.class)
                        .block();

                apiCallCount.incrementAndGet();
                return response;

            } catch (Exception e) {
                log.warn("Details API 호출 실패 (시도 {}/{}) - placeId: {}, 에러: {}",
                        attempt, MAX_RETRIES, placeId, e.getMessage());
                if (attempt < MAX_RETRIES) {
                    sleep(INITIAL_RETRY_DELAY_MS * (long) Math.pow(2, attempt - 1));
                }
            }
        }

        log.error("Details API 최종 실패 - placeId: {}", placeId);
        return null;
    }

    private PlaceDto mapToPlaceDto(TextSearchResponseDto.Result result, String region) {
        Double lat = null;
        Double lng = null;
        if (result.getGeometry() != null && result.getGeometry().getLocation() != null) {
            lat = result.getGeometry().getLocation().getLat();
            lng = result.getGeometry().getLocation().getLng();
        }

        return PlaceDto.builder()
                .placeId(result.getPlaceId())
                .name(result.getName())
                .formattedAddress(result.getFormattedAddress())
                .latitude(lat)
                .longitude(lng)
                .rating(result.getRating())
                .userRatingsTotal(result.getUserRatingsTotal())
                .types(result.getTypes())
                .region(region)
                .collectedAt(LocalDateTime.now())
                .build();
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("대기 중 인터럽트 발생");
        }
    }
}
