package com.drop.global.geocoding;

import com.drop.global.geocoding.dto.AddressValidationResponseDto;
import com.drop.global.geocoding.dto.KakaoGeocodingResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeocodingService {

    private final WebClient kakaoWebClient;

    public record Coordinates(Double latitude, Double longitude) {}

    /**
     * 주소를 위도/경도로 변환합니다.
     * @param address 주소 문자열
     * @return 위도/경도 좌표 (변환 실패 시 빈 Optional)
     */
    public Optional<Coordinates> getCoordinates(String address) {
        if (address == null || address.isBlank()) {
            return Optional.empty();
        }

        try {
            KakaoGeocodingResponseDto response = callGeocodingApi(address);

            if (response == null || response.getDocuments() == null || response.getDocuments().isEmpty()) {
                log.warn("주소 변환 실패 - 결과 없음: {}", address);
                return Optional.empty();
            }

            KakaoGeocodingResponseDto.Document doc = response.getDocuments().get(0);
            Double latitude = Double.parseDouble(doc.getY());
            Double longitude = Double.parseDouble(doc.getX());

            log.info("주소 변환 성공: {} -> ({}, {})", address, latitude, longitude);
            return Optional.of(new Coordinates(latitude, longitude));

        } catch (Exception e) {
            log.error("주소 변환 API 호출 실패: {} - {}", address, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * 주소 유효성을 검증합니다.
     * @param query 검색할 주소
     * @return 검증 결과 (유효 여부, 정제된 주소, 좌표)
     */
    public AddressValidationResponseDto validateAddress(String query) {
        if (query == null || query.isBlank()) {
            return AddressValidationResponseDto.invalid(query);
        }

        try {
            KakaoGeocodingResponseDto response = callGeocodingApi(query);

            if (response == null || response.getDocuments() == null || response.getDocuments().isEmpty()) {
                return AddressValidationResponseDto.invalid(query);
            }

            KakaoGeocodingResponseDto.Document doc = response.getDocuments().get(0);
            Double latitude = Double.parseDouble(doc.getY());
            Double longitude = Double.parseDouble(doc.getX());

            String address = doc.getAddressName();
            String roadAddress = doc.getRoadAddress() != null
                    ? doc.getRoadAddress().getAddressName()
                    : null;

            return AddressValidationResponseDto.valid(address, roadAddress, latitude, longitude);

        } catch (Exception e) {
            log.error("주소 검증 API 호출 실패: {} - {}", query, e.getMessage());
            return AddressValidationResponseDto.invalid(query);
        }
    }

    private KakaoGeocodingResponseDto callGeocodingApi(String address) {
        return kakaoWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/local/search/address.json")
                        .queryParam("query", address)
                        .build())
                .retrieve()
                .bodyToMono(KakaoGeocodingResponseDto.class)
                .block();
    }
}
