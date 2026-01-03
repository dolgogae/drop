package com.drop.domain.fee.service;

import com.drop.domain.fee.data.CrossfitBoxFee;
import com.drop.domain.fee.dto.CrossfitBoxFeeDto;
import com.drop.domain.fee.dto.CrossfitBoxFeeCreateDto;
import com.drop.domain.fee.dto.CrossfitBoxFeeUpdateDto;
import com.drop.domain.fee.mapper.CrossfitBoxFeeMapper;
import com.drop.domain.fee.repository.CrossfitBoxFeeRepository;
import com.drop.domain.crossfitbox.data.CrossfitBox;
import com.drop.domain.crossfitbox.repository.CrossfitBoxRepository;
import com.drop.domain.auth.service.UserService;
import com.drop.global.code.error.ErrorCode;
import com.drop.global.code.error.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FeeService {
    private final CrossfitBoxFeeRepository crossfitBoxFeeRepository;
    private final CrossfitBoxRepository crossfitBoxRepository;
    private final UserService userService;
    private final CrossfitBoxFeeMapper crossfitBoxFeeMapper;

    @Transactional
    public CrossfitBoxFeeDto createCrossfitBoxFee(CrossfitBoxFeeCreateDto crossfitBoxFeeCreateDto){
        Long userId = userService.getUserId(crossfitBoxFeeCreateDto.getToken());
        CrossfitBox crossfitBox = crossfitBoxRepository.findById(userId).orElseThrow(() ->
            new BusinessException(ErrorCode.USER_NOT_EXIST));

        CrossfitBoxFee crossfitBoxFee = CrossfitBoxFee.create(crossfitBoxFeeCreateDto, crossfitBox);

        CrossfitBoxFee savedCrossfitBoxFee = crossfitBoxFeeRepository.save(crossfitBoxFee);

        return crossfitBoxFeeMapper.toDto(savedCrossfitBoxFee);
    }

    @Transactional
    public CrossfitBoxFeeDto updateFee(CrossfitBoxFeeUpdateDto crossfitBoxFeeUpdateDto){
        CrossfitBoxFee crossfitBoxFee = crossfitBoxFeeRepository.findById(crossfitBoxFeeUpdateDto.getFeeId()).orElseThrow(() ->
                new BusinessException(ErrorCode.USER_NOT_EXIST));
        crossfitBoxFee.updateFee(crossfitBoxFeeUpdateDto);
        CrossfitBoxFee savedCrossfitBoxFee = crossfitBoxFeeRepository.save(crossfitBoxFee);

        return crossfitBoxFeeMapper.toDto(savedCrossfitBoxFee);
    }

    public CrossfitBoxFeeDto getCrossfitBoxFee(Long id) {
        CrossfitBoxFee crossfitBoxFee = crossfitBoxFeeRepository.findById(id).orElseThrow(() ->
                new BusinessException(ErrorCode.NOT_FOUND_FEE));

        return crossfitBoxFeeMapper.toDto(crossfitBoxFee);
    }
}
