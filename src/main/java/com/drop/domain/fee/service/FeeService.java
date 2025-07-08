package com.drop.domain.fee.service;

import com.drop.domain.fee.data.GymFee;
import com.drop.domain.fee.dto.FeeDto;
import com.drop.domain.fee.dto.GymFeeCreateDto;
import com.drop.domain.fee.dto.GymFeeUpdateDto;
import com.drop.domain.fee.mapper.GymFeeMapper;
import com.drop.domain.fee.repository.GymFeeRepository;
import com.drop.domain.user.gym.data.Gym;
import com.drop.domain.user.gym.repository.GymRepository;
import com.drop.domain.user.userbase.service.UserService;
import com.drop.global.code.error.ErrorCode;
import com.drop.global.code.error.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FeeService {
    private final GymFeeRepository gymFeeRepository;
    private final GymRepository gymRepository;
    private final UserService userService;

    public FeeDto createGymFee(GymFeeCreateDto gymFeeCreateDto){
        Long userId = userService.getUserId(gymFeeCreateDto.getToken());
        Gym gym = gymRepository.findById(userId).orElseThrow(() ->
            new BusinessException(ErrorCode.USER_NOT_EXIST));

        GymFee gymFee = GymFee.create(gymFeeCreateDto, gym);

        GymFee savedGymFee = gymFeeRepository.save(gymFee);

        return GymFeeMapper.INSTANCE.toDto(savedGymFee);
    }

    public FeeDto updateFee(GymFeeUpdateDto gymFeeUpdateDto){
        GymFee gymFee = gymFeeRepository.findById(gymFeeUpdateDto.getFeeId()).orElseThrow(() ->
                new BusinessException(ErrorCode.USER_NOT_EXIST));
        gymFee.updateFee(gymFeeUpdateDto);
        GymFee savedGymFee = gymFeeRepository.save(gymFee);

        return GymFeeMapper.INSTANCE.toDto(savedGymFee);
    }
}
