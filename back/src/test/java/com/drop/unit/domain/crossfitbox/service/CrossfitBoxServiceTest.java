package com.drop.unit.domain.crossfitbox.service;

import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.dto.CrossfitBoxCreateDto;
import com.drop.domain.crossfitbox.dto.CrossfitBoxDto;
import com.drop.domain.crossfitbox.mapper.CrossfitBoxMapper;
import com.drop.domain.crossfitbox.repository.CrossfitBoxRepository;
import com.drop.domain.crossfitbox.service.CrossfitBoxService;
import com.drop.domain.geocoding.service.GeocodingService;
import com.drop.global.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@ExtendWith(SpringExtension.class)
class CrossfitBoxServiceTest {
    @MockBean
    CrossfitBoxMapper crossfitBoxMapper;
    @MockBean
    CrossfitBoxRepository crossfitBoxRepository;
    @MockBean
    GeocodingService geocodingService;
    CrossfitBoxService crossfitBoxService;

    @BeforeEach
    void init(){
        crossfitBoxService = new CrossfitBoxService(crossfitBoxMapper, crossfitBoxRepository, geocodingService);
    }

    @Test
    void createCrossfitBoxTest(){
        // given
        CrossfitBoxCreateDto crossfitBoxCreateDto = CrossfitBoxCreateDto.builder()
                .username("username")
                .email("test@email.com")
                .password("1234")
                .role(UserRole.GYM)
                .phoneNumber("010-1234-5678")
                .usageInfoDto(CrossfitBoxCreateDto.CrossfitBoxUsageInfoDto.builder()
                        .locker(true)
                        .parking(true)
                        .wear(true)
                        .build())
                .build();
        CrossfitBoxDto expectedResult = CrossfitBoxDto.builder()
                .username("username")
                .email("test@email.com")
                .role(UserRole.GYM)
                .phoneNumber("010-1234-5678")
                .build();
        CrossfitBox crossfitBox = CrossfitBox.create(crossfitBoxCreateDto);
        when(crossfitBoxRepository.save(any())).thenReturn(crossfitBox);
        when(crossfitBoxMapper.toDto(any())).thenReturn(expectedResult);

        // when
        CrossfitBoxDto result = crossfitBoxService.createCrossfitBox(crossfitBoxCreateDto);

        // then
        assertThat(result).usingRecursiveComparison().isEqualTo(expectedResult);
    }
}
