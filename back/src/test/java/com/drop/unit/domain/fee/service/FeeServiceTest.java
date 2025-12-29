package com.drop.unit.domain.fee.service;

import com.drop.domain.fee.data.GymFee;
import com.drop.domain.fee.dto.GymFeeCreateDto;
import com.drop.domain.fee.dto.GymFeeDto;
import com.drop.domain.fee.dto.GymFeeUpdateDto;
import com.drop.domain.fee.repository.GymFeeRepository;
import com.drop.domain.fee.service.FeeService;
import com.drop.domain.gym.data.Gym;
import com.drop.domain.gym.repository.GymRepository;
import com.drop.domain.auth.service.UserService;
import com.drop.global.code.error.ErrorCode;
import com.drop.global.code.error.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@ExtendWith(SpringExtension.class)
class FeeServiceTest {
    @MockBean
    GymFeeRepository gymFeeRepository;
    @MockBean
    GymRepository gymRepository;
    @MockBean
    UserService userService;
    FeeService feeService;

    @BeforeEach
    void init() {
        feeService = new FeeService(gymFeeRepository, gymRepository, userService);
    }

    @Test
    void createGymFeeTest() {
        // given
        Gym gym = Gym.builder().id(10L).build();
        GymFeeCreateDto createDto = new GymFeeCreateDto("token", 50000L, 12);
        GymFee gymFee = GymFee.builder().id(1L).gym(gym).price(50000L).frequency(12).build();
        GymFee savedGymFee = gymFee;
        GymFeeDto expected = new GymFeeDto(1L, 10L, 50000L, 12);
        when(userService.getUserId("token")).thenReturn(10L);
        when(gymRepository.findById(10L)).thenReturn(Optional.of(gym));
        when(gymFeeRepository.save(any())).thenReturn(savedGymFee);
        // when
        GymFeeDto result = feeService.createGymFee(createDto);
        // then
        assertThat(result).usingRecursiveComparison().isEqualTo(expected);
    }

    @Test
    void createGymFee_존재하지않는_유저_예외() {
        GymFeeCreateDto createDto = new GymFeeCreateDto("token", 50000L, 12);
        when(userService.getUserId("token")).thenReturn(10L);
        when(gymRepository.findById(10L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> feeService.createGymFee(createDto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(ErrorCode.USER_NOT_EXIST.getMessage());
    }

    @Test
    void updateFeeTest() {
        // given
        Gym gym = Gym.builder().id(10L).build();
        GymFeeUpdateDto updateDto = new GymFeeUpdateDto(1L, 60000L, 24);
        GymFee gymFee = GymFee.builder().id(1L).gym(gym).price(50000L).frequency(12).build();
        GymFee updatedGymFee = GymFee.builder().id(1L).gym(gym).price(60000L).frequency(24).build();
        GymFeeDto expected = new GymFeeDto(1L, 10L, 60000L, 24);
        when(gymFeeRepository.findById(1L)).thenReturn(Optional.of(gymFee));
        when(gymFeeRepository.save(gymFee)).thenReturn(updatedGymFee);
        // when
        GymFeeDto result = feeService.updateFee(updateDto);
        // then
        assertThat(result).usingRecursiveComparison().isEqualTo(expected);
    }

    @Test
    void updateFee_존재하지않는_요금_예외() {
        GymFeeUpdateDto updateDto = new GymFeeUpdateDto(1L, 60000L, 24);
        when(gymFeeRepository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> feeService.updateFee(updateDto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(ErrorCode.USER_NOT_EXIST.getMessage());
    }

    @Test
    void getGymFeeTest() {
        // given
        Gym gym = Gym.builder().id(10L).build();
        GymFee gymFee = GymFee.builder().id(1L).gym(gym).price(50000L).frequency(12).build();
        GymFeeDto expected = new GymFeeDto(1L, 10L, 50000L, 12);
        when(gymFeeRepository.findById(1L)).thenReturn(Optional.of(gymFee));
        // when
        GymFeeDto result = feeService.getGymFee(1L);
        // then
        assertThat(result).usingRecursiveComparison().isEqualTo(expected);
    }

    @Test
    void getGymFee_존재하지않는_요금_예외() {
        when(gymFeeRepository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> feeService.getGymFee(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining(ErrorCode.NOT_FOUND_FEE.getMessage());
    }
} 