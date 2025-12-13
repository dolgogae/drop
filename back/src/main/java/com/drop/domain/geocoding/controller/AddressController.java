package com.drop.domain.geocoding.controller;

import com.drop.domain.geocoding.dto.AddressValidationResponseDto;
import com.drop.domain.geocoding.service.GeocodingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Address", description = "주소 검증 API")
@RestController
@RequestMapping("/api/address")
@RequiredArgsConstructor
public class AddressController {

    private final GeocodingService geocodingService;

    @Operation(summary = "주소 유효성 검증", description = "입력된 주소가 유효한지 검증하고 좌표를 반환합니다.")
    @GetMapping("/validate")
    public ResponseEntity<AddressValidationResponseDto> validateAddress(
            @Parameter(description = "검증할 주소") @RequestParam String query
    ) {
        AddressValidationResponseDto result = geocodingService.validateAddress(query);
        return ResponseEntity.ok(result);
    }
}
