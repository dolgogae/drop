package com.drop.domain.fee.service;

import com.drop.domain.fee.data.GymFee;
import com.drop.domain.fee.dto.GymFeeDto;
import com.drop.domain.fee.dto.GymFeeCreateDto;
import com.drop.domain.fee.dto.GymFeeUpdateDto;
import com.drop.domain.fee.mapper.GymFeeMapper;
import com.drop.domain.fee.repository.GymFeeRepository;
import com.drop.domain.gym.data.Gym;
import com.drop.domain.gym.repository.GymRepository;
import com.drop.domain.auth.service.UserService;
import com.drop.global.code.error.ErrorCode;
import com.drop.global.code.error.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FeeService {
    private final GymFeeRepository gymFeeRepository;
    private final GymRepository gymRepository;
    private final UserService userService;
    private final GymFeeMapper gymFeeMapper;

    @Transactional
    public GymFeeDto createGymFee(GymFeeCreateDto gymFeeCreateDto){
        Long userId = userService.getUserId(gymFeeCreateDto.getToken());
        Gym gym = gymRepository.findById(userId).orElseThrow(() ->
            new BusinessException(ErrorCode.USER_NOT_EXIST));

        GymFee gymFee = GymFee.create(gymFeeCreateDto, gym);

        GymFee savedGymFee = gymFeeRepository.save(gymFee);

        return gymFeeMapper.toDto(savedGymFee);
    }

    @Transactional
    public GymFeeDto updateFee(GymFeeUpdateDto gymFeeUpdateDto){
        GymFee gymFee = gymFeeRepository.findById(gymFeeUpdateDto.getFeeId()).orElseThrow(() ->
                new BusinessException(ErrorCode.USER_NOT_EXIST));
        gymFee.updateFee(gymFeeUpdateDto);
        GymFee savedGymFee = gymFeeRepository.save(gymFee);

        return gymFeeMapper.toDto(savedGymFee);
    }

    public GymFeeDto getGymFee(Long id) {
        GymFee gymFee = gymFeeRepository.findById(id).orElseThrow(() ->
                new BusinessException(ErrorCode.NOT_FOUND_FEE));

        return gymFeeMapper.toDto(gymFee);
    }
}
