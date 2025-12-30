package com.drop.unit.domain.gym.service;

import com.drop.domain.gym.data.Gym;
import com.drop.domain.gym.dto.GymCreateDto;
import com.drop.domain.gym.dto.GymDto;
import com.drop.domain.gym.repository.GymRepository;
import com.drop.domain.gym.service.GymService;
import com.drop.global.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.modelmapper.ModelMapper;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@ExtendWith(SpringExtension.class)
class GymServiceTest {
    ModelMapper modelMapper = new ModelMapper();
    @MockBean
    GymRepository gymRepository;
    GymService gymService;

    @BeforeEach
    void init(){
        gymService = new GymService(modelMapper, gymRepository);
    }

    @Test
    void createGymTest(){
        // given
        GymCreateDto gymCreateDto = GymCreateDto.builder()
                .username("username")
                .email("test@email.com")
                .password("1234")
                .role(UserRole.GYM)
                .location("some location")
                .phoneNumber("01012345678")
                .usageInfoDto(GymCreateDto.GymUsageInfoDto.builder()
                        .locker(true)
                        .parking(true)
                        .wear(true)
                        .build())
                .build();
        GymDto expectedResult = GymDto.builder()
                .username("username")
                .email("test@email.com")
                .password("1234")
                .role(UserRole.GYM)
                .location("some location")
                .phoneNumber("01012345678")
                .build();
        Gym gym = Gym.create(gymCreateDto);
        when(gymRepository.save(any())).thenReturn(gym);

        // when
        GymDto result = gymService.createGym(gymCreateDto);

        // then
        assertThat(result).usingRecursiveComparison().isEqualTo(expectedResult);
    }
}