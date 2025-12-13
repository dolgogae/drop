package com.drop.domain.user.gym.service;

import com.drop.domain.user.gym.data.Gym;
import com.drop.domain.user.gym.dto.GymCreateDto;
import com.drop.domain.user.gym.dto.GymDto;
import com.drop.domain.user.gym.mapper.GymMapper;
import com.drop.domain.user.gym.repository.GymRepository;
import com.drop.domain.geocoding.service.GeocodingService;
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

        // location을 기반으로 위도/경도 자동 설정
        if (gymCreateDto.getLocation() != null && !gymCreateDto.getLocation().isBlank()) {
            geocodingService.getCoordinates(gymCreateDto.getLocation())
                    .ifPresent(coords -> gym.updateCoordinates(coords.latitude(), coords.longitude()));
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
}
