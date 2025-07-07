package com.drop.domain.user.gym.service;

import com.drop.domain.user.gym.data.Gym;
import com.drop.domain.user.gym.dto.GymCreateDto;
import com.drop.domain.user.gym.dto.GymDto;
import com.drop.domain.user.gym.repository.GymRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GymService {
    private final ModelMapper modelMapper;
    private final GymRepository gymRepository;

    @Transactional
    public GymDto createGym(GymCreateDto gymCreateDto){
        Gym gym = Gym.create(gymCreateDto);
        Gym savedGym = gymRepository.save(gym);

        GymDto result = modelMapper.map(savedGym, GymDto.class);
        return result;
    }
}
