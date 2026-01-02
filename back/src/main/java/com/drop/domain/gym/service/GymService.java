package com.drop.domain.gym.service;

import com.drop.domain.geocoding.service.GeocodingService;
import com.drop.domain.gym.data.Gym;
import com.drop.domain.gym.dto.GymCreateDto;
import com.drop.domain.gym.dto.GymDto;
import com.drop.domain.gym.mapper.GymMapper;
import com.drop.domain.gym.repository.GymRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GymService {
    private final GymMapper gymMapper;
    private final GymRepository gymRepository;
    private final GeocodingService geocodingService;

    @Transactional
    public GymDto createGym(GymCreateDto gymCreateDto){
        Gym gym = Gym.create(gymCreateDto);

        // 주소를 기반으로 위도/경도 자동 설정 (실패 시 예외 발생)
        if (gymCreateDto.getAddress() != null && gymCreateDto.getAddress().getAddressLine1() != null) {
            GeocodingService.Coordinates coords = geocodingService.getCoordinates(gymCreateDto.getAddress().getAddressLine1())
                    .orElseThrow(() -> new IllegalStateException("주소를 좌표로 변환할 수 없습니다. 주소를 확인해주세요."));
            gym.updateCoordinates(coords.latitude(), coords.longitude());
        }

        Gym savedGym = gymRepository.save(gym);
        return gymMapper.toDto(savedGym);
    }

    @Transactional(readOnly = true)
    public List<GymDto> getAllGymsWithLocation() {
        return gymRepository.findAllWithLocation().stream()
                .map(gymMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GymDto> getGymsByBounds(Double swLat, Double swLng, Double neLat, Double neLng) {
        return gymRepository.findByBounds(swLat, swLng, neLat, neLng).stream()
                .map(gymMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GymDto getGymById(Long gymId) {
        Gym gym = gymRepository.findById(gymId)
                .orElseThrow(() -> new IllegalArgumentException("체육관을 찾을 수 없습니다."));
        return gymMapper.toDto(gym);
    }

    @Transactional(readOnly = true)
    public List<GymDto> searchByName(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }
        return gymRepository.searchByName(keyword.trim()).stream()
                .map(gymMapper::toDto)
                .collect(Collectors.toList());
    }

    private static final double DEFAULT_RADIUS_KM = 5.0;

    @Transactional(readOnly = true)
    public int countNearbyGyms(Double latGrid, Double lngGrid) {
        if (latGrid == null || lngGrid == null) {
            return (int) gymRepository.count();
        }

        double deltaLat = DEFAULT_RADIUS_KM / 111.0;
        double deltaLng = DEFAULT_RADIUS_KM / (111.0 * Math.cos(Math.toRadians(latGrid)));

        double swLat = latGrid - deltaLat;
        double neLat = latGrid + deltaLat;
        double swLng = lngGrid - deltaLng;
        double neLng = lngGrid + deltaLng;

        return gymRepository.findByBounds(swLat, swLng, neLat, neLng).size();
    }
}
