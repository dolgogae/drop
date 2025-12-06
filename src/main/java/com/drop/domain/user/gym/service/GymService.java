package com.drop.domain.user.gym.service;

import com.drop.domain.user.gym.data.Gym;
import com.drop.domain.user.gym.dto.GymCreateDto;
import com.drop.domain.user.gym.dto.GymDto;
import com.drop.domain.user.gym.mapper.GymMapper;
import com.drop.domain.user.gym.repository.GymRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GymService {
    private final GymMapper gymMapper;
    private final GymRepository gymRepository;

    @Transactional
    public GymDto createGym(GymCreateDto gymCreateDto){
        Gym gym = Gym.create(gymCreateDto);
        Gym savedGym = gymRepository.save(gym);

        return gymMapper.toDto(savedGym);
    }
}
