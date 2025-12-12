package com.drop.domain.place.service;

import com.drop.domain.place.data.RegisteredGym;
import com.drop.domain.place.dto.GymRegisterRequestDto;
import com.drop.domain.place.dto.RegisteredGymDto;
import com.drop.domain.place.repository.RegisteredGymRepository;
import com.drop.global.code.error.ErrorCode;
import com.drop.global.code.error.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegisteredGymService {

    private final RegisteredGymRepository registeredGymRepository;

    @Transactional
    public RegisteredGymDto registerGym(Long userId, GymRegisterRequestDto requestDto) {
        // 중복 등록 체크
        if (registeredGymRepository.existsByUserIdAndKakaoPlaceId(userId, requestDto.getKakaoPlaceId())) {
            throw new BusinessException(ErrorCode.GYM_ALREADY_REGISTERED);
        }

        RegisteredGym gym = RegisteredGym.builder()
                .userId(userId)
                .kakaoPlaceId(requestDto.getKakaoPlaceId())
                .displayName(requestDto.getDisplayName())
                .address(requestDto.getAddress())
                .roadAddress(requestDto.getRoadAddress())
                .phone(requestDto.getPhone())
                .latitude(requestDto.getLatitude())
                .longitude(requestDto.getLongitude())
                .placeUrl(requestDto.getPlaceUrl())
                .note(requestDto.getNote())
                .tags(requestDto.getTags())
                .isFavorite(requestDto.getIsFavorite() != null ? requestDto.getIsFavorite() : false)
                .build();

        RegisteredGym savedGym = registeredGymRepository.save(gym);
        return RegisteredGymDto.from(savedGym);
    }

    @Transactional(readOnly = true)
    public List<RegisteredGymDto> getMyGyms(Long userId) {
        return registeredGymRepository.findByUserId(userId).stream()
                .map(RegisteredGymDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RegisteredGymDto> getMyFavoriteGyms(Long userId) {
        return registeredGymRepository.findByUserIdAndIsFavoriteTrue(userId).stream()
                .map(RegisteredGymDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteGym(Long userId, Long gymId) {
        RegisteredGym gym = registeredGymRepository.findById(gymId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GYM_NOT_FOUND));

        if (!gym.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.GYM_ACCESS_DENIED);
        }

        registeredGymRepository.delete(gym);
    }

    @Transactional
    public RegisteredGymDto toggleFavorite(Long userId, Long gymId) {
        RegisteredGym gym = registeredGymRepository.findById(gymId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GYM_NOT_FOUND));

        if (!gym.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.GYM_ACCESS_DENIED);
        }

        gym.toggleFavorite();
        return RegisteredGymDto.from(gym);
    }

    @Transactional
    public RegisteredGymDto updateNote(Long userId, Long gymId, String note) {
        RegisteredGym gym = registeredGymRepository.findById(gymId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GYM_NOT_FOUND));

        if (!gym.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.GYM_ACCESS_DENIED);
        }

        gym.updateNote(note);
        return RegisteredGymDto.from(gym);
    }
}
