package com.drop.domain.crossfitbox.service;

import com.drop.domain.geocoding.service.GeocodingService;
import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.dto.CrossfitBoxCreateDto;
import com.drop.domain.crossfitbox.dto.CrossfitBoxDto;
import com.drop.domain.crossfitbox.mapper.CrossfitBoxMapper;
import com.drop.domain.crossfitbox.repository.CrossfitBoxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrossfitBoxService {
    private final CrossfitBoxMapper crossfitBoxMapper;
    private final CrossfitBoxRepository crossfitBoxRepository;
    private final GeocodingService geocodingService;

    @Transactional
    public CrossfitBoxDto createCrossfitBox(CrossfitBoxCreateDto crossfitBoxCreateDto){
        CrossfitBox crossfitBox = CrossfitBox.create(crossfitBoxCreateDto);

        // 주소를 기반으로 위도/경도 자동 설정 (실패 시 예외 발생)
        if (crossfitBoxCreateDto.getAddress() != null && crossfitBoxCreateDto.getAddress().getAddressLine1() != null) {
            GeocodingService.Coordinates coords = geocodingService.getCoordinates(crossfitBoxCreateDto.getAddress().getAddressLine1())
                    .orElseThrow(() -> new IllegalStateException("주소를 좌표로 변환할 수 없습니다. 주소를 확인해주세요."));
            crossfitBox.updateCoordinates(coords.latitude(), coords.longitude());
        }

        CrossfitBox savedCrossfitBox = crossfitBoxRepository.save(crossfitBox);
        return crossfitBoxMapper.toDto(savedCrossfitBox);
    }

    @Transactional(readOnly = true)
    public List<CrossfitBoxDto> getAllCrossfitBoxesWithLocation() {
        return crossfitBoxRepository.findAllWithLocation().stream()
                .map(crossfitBoxMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CrossfitBoxDto> getCrossfitBoxesByBounds(Double swLat, Double swLng, Double neLat, Double neLng) {
        return crossfitBoxRepository.findByBounds(swLat, swLng, neLat, neLng).stream()
                .map(crossfitBoxMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CrossfitBoxDto getCrossfitBoxById(Long crossfitBoxId) {
        CrossfitBox crossfitBox = crossfitBoxRepository.findById(crossfitBoxId)
                .orElseThrow(() -> new IllegalArgumentException("크로스핏박스를 찾을 수 없습니다."));
        return crossfitBoxMapper.toDto(crossfitBox);
    }

    @Transactional(readOnly = true)
    public List<CrossfitBoxDto> searchByName(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }
        return crossfitBoxRepository.searchByName(keyword.trim()).stream()
                .map(crossfitBoxMapper::toDto)
                .collect(Collectors.toList());
    }

    private static final double DEFAULT_RADIUS_KM = 5.0;

    @Transactional(readOnly = true)
    public int countNearbyCrossfitBoxes(Double latGrid, Double lngGrid) {
        if (latGrid == null || lngGrid == null) {
            return (int) crossfitBoxRepository.count();
        }

        double deltaLat = DEFAULT_RADIUS_KM / 111.0;
        double deltaLng = DEFAULT_RADIUS_KM / (111.0 * Math.cos(Math.toRadians(latGrid)));

        double swLat = latGrid - deltaLat;
        double neLat = latGrid + deltaLat;
        double swLng = lngGrid - deltaLng;
        double neLng = lngGrid + deltaLng;

        return crossfitBoxRepository.findByBounds(swLat, swLng, neLat, neLng).size();
    }
}
