package com.drop.unit.domain.geocoding.service;

import com.drop.domain.geocoding.dto.AddressValidationResponseDto;
import com.drop.domain.geocoding.dto.KakaoGeocodingResponseDto;
import com.drop.domain.geocoding.service.GeocodingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GeocodingServiceTest {

    @Mock
    private WebClient kakaoWebClient;

    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    private GeocodingService geocodingService;

    @BeforeEach
    void setUp() {
        geocodingService = new GeocodingService(kakaoWebClient);
    }

    @Test
    @DisplayName("좌표 조회 - null 주소")
    void getCoordinates_nullAddress() {
        // when
        Optional<GeocodingService.Coordinates> result = geocodingService.getCoordinates(null);

        // then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("좌표 조회 - 빈 주소")
    void getCoordinates_emptyAddress() {
        // when
        Optional<GeocodingService.Coordinates> result = geocodingService.getCoordinates("");

        // then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("좌표 조회 - 공백 주소")
    void getCoordinates_blankAddress() {
        // when
        Optional<GeocodingService.Coordinates> result = geocodingService.getCoordinates("   ");

        // then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("좌표 조회 - 성공")
    void getCoordinates_success() {
        // given
        KakaoGeocodingResponseDto.Document doc = new KakaoGeocodingResponseDto.Document();
        ReflectionTestUtils.setField(doc, "x", "127.0");
        ReflectionTestUtils.setField(doc, "y", "37.5");
        ReflectionTestUtils.setField(doc, "addressName", "서울시 강남구");

        KakaoGeocodingResponseDto response = new KakaoGeocodingResponseDto();
        ReflectionTestUtils.setField(response, "documents", List.of(doc));

        when(kakaoWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(KakaoGeocodingResponseDto.class))
                .thenReturn(Mono.just(response));

        // when
        Optional<GeocodingService.Coordinates> result = geocodingService.getCoordinates("서울시 강남구");

        // then
        assertThat(result).isPresent();
        assertThat(result.get().latitude()).isEqualTo(37.5);
        assertThat(result.get().longitude()).isEqualTo(127.0);
    }

    @Test
    @DisplayName("좌표 조회 - 결과 없음")
    void getCoordinates_noResult() {
        // given
        KakaoGeocodingResponseDto response = new KakaoGeocodingResponseDto();
        ReflectionTestUtils.setField(response, "documents", new ArrayList<>());

        when(kakaoWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(KakaoGeocodingResponseDto.class))
                .thenReturn(Mono.just(response));

        // when
        Optional<GeocodingService.Coordinates> result = geocodingService.getCoordinates("잘못된 주소");

        // then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("좌표 조회 - API 호출 실패")
    void getCoordinates_apiError() {
        // given
        when(kakaoWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(KakaoGeocodingResponseDto.class))
                .thenReturn(Mono.error(new RuntimeException("API Error")));

        // when
        Optional<GeocodingService.Coordinates> result = geocodingService.getCoordinates("서울시 강남구");

        // then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("주소 검증 - null 주소")
    void validateAddress_nullAddress() {
        // when
        AddressValidationResponseDto result = geocodingService.validateAddress(null);

        // then
        assertThat(result.isValid()).isFalse();
    }

    @Test
    @DisplayName("주소 검증 - 빈 주소")
    void validateAddress_emptyAddress() {
        // when
        AddressValidationResponseDto result = geocodingService.validateAddress("");

        // then
        assertThat(result.isValid()).isFalse();
    }

    @Test
    @DisplayName("주소 검증 - 성공")
    void validateAddress_success() {
        // given
        KakaoGeocodingResponseDto.RoadAddress roadAddress = new KakaoGeocodingResponseDto.RoadAddress();
        ReflectionTestUtils.setField(roadAddress, "addressName", "서울시 강남구 테헤란로 123");

        KakaoGeocodingResponseDto.Document doc = new KakaoGeocodingResponseDto.Document();
        ReflectionTestUtils.setField(doc, "x", "127.0");
        ReflectionTestUtils.setField(doc, "y", "37.5");
        ReflectionTestUtils.setField(doc, "addressName", "서울시 강남구 테헤란로");
        ReflectionTestUtils.setField(doc, "roadAddress", roadAddress);

        KakaoGeocodingResponseDto response = new KakaoGeocodingResponseDto();
        ReflectionTestUtils.setField(response, "documents", List.of(doc));

        when(kakaoWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(KakaoGeocodingResponseDto.class))
                .thenReturn(Mono.just(response));

        // when
        AddressValidationResponseDto result = geocodingService.validateAddress("서울시 강남구");

        // then
        assertThat(result.isValid()).isTrue();
        assertThat(result.getAddress()).isEqualTo("서울시 강남구 테헤란로");
        assertThat(result.getRoadAddress()).isEqualTo("서울시 강남구 테헤란로 123");
    }

    @Test
    @DisplayName("주소 검증 - 결과 없음")
    void validateAddress_noResult() {
        // given
        KakaoGeocodingResponseDto response = new KakaoGeocodingResponseDto();
        ReflectionTestUtils.setField(response, "documents", new ArrayList<>());

        when(kakaoWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(KakaoGeocodingResponseDto.class))
                .thenReturn(Mono.just(response));

        // when
        AddressValidationResponseDto result = geocodingService.validateAddress("잘못된 주소");

        // then
        assertThat(result.isValid()).isFalse();
    }
}
