package com.drop.domain.place.service;

import com.drop.domain.place.dto.KakaoPlaceResponseDto;
import com.drop.domain.place.dto.PlaceDto;
import com.drop.domain.place.dto.PlaceSearchResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoPlaceService {

    private final WebClient kakaoWebClient;
    private static final int MAX_PAGES = 3;
    private static final int PAGE_SIZE = 15;

    public PlaceSearchResponseDto searchPlacesByRect(
            Double swLat, Double swLng,
            Double neLat, Double neLng,
            String query
    ) {
        List<PlaceDto> allPlaces = new ArrayList<>();
        int page = 1;
        boolean hasMore = true;
        int totalCount = 0;

        // rect 형식: "x1,y1,x2,y2" (서쪽경도,남쪽위도,동쪽경도,북쪽위도)
        String rect = String.format("%f,%f,%f,%f", swLng, swLat, neLng, neLat);

        while (page <= MAX_PAGES && hasMore) {
            KakaoPlaceResponseDto response = searchKeyword(query, rect, page);

            if (response == null || response.getDocuments() == null) {
                break;
            }

            if (page == 1) {
                totalCount = response.getMeta().getTotalCount();
            }

            List<PlaceDto> places = response.getDocuments().stream()
                    .map(PlaceDto::from)
                    .collect(Collectors.toList());

            allPlaces.addAll(places);

            hasMore = !response.getMeta().getIsEnd();
            page++;
        }

        return PlaceSearchResponseDto.builder()
                .places(allPlaces)
                .count(allPlaces.size())
                .totalCount(totalCount)
                .hasMore(totalCount > allPlaces.size())
                .build();
    }

    private KakaoPlaceResponseDto searchKeyword(String query, String rect, int page) {
        try {
            return kakaoWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v2/local/search/keyword.json")
                            .queryParam("query", query)
                            .queryParam("rect", rect)
                            .queryParam("page", page)
                            .queryParam("size", PAGE_SIZE)
                            .build())
                    .retrieve()
                    .bodyToMono(KakaoPlaceResponseDto.class)
                    .block();
        } catch (Exception e) {
            log.error("카카오 장소 검색 API 호출 실패: {}", e.getMessage());
            return null;
        }
    }
}
