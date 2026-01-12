package com.drop.unit.domain.geocoding.controller;

import com.drop.domain.geocoding.controller.AddressController;
import com.drop.domain.geocoding.dto.AddressValidationResponseDto;
import com.drop.domain.geocoding.service.GeocodingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AddressControllerTest {

    private MockMvc mockMvc;

    @Mock
    private GeocodingService geocodingService;

    @InjectMocks
    private AddressController addressController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(addressController).build();
    }

    @Test
    @DisplayName("주소 유효성 검증 - 성공")
    void validateAddress_success() throws Exception {
        // given
        AddressValidationResponseDto dto = AddressValidationResponseDto.builder()
                .valid(true)
                .address("서울시 강남구")
                .roadAddress("서울시 강남구 테헤란로")
                .latitude(37.5)
                .longitude(127.0)
                .build();

        when(geocodingService.validateAddress("서울시 강남구")).thenReturn(dto);

        // when & then
        mockMvc.perform(get("/address/validate")
                        .param("query", "서울시 강남구"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.address").value("서울시 강남구"));
    }

    @Test
    @DisplayName("주소 유효성 검증 - 실패")
    void validateAddress_invalid() throws Exception {
        // given
        AddressValidationResponseDto dto = AddressValidationResponseDto.builder()
                .valid(false)
                .build();

        when(geocodingService.validateAddress("잘못된 주소")).thenReturn(dto);

        // when & then
        mockMvc.perform(get("/address/validate")
                        .param("query", "잘못된 주소"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false));
    }
}
