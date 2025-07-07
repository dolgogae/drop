package com.drop.domain.fee.service;

import com.drop.domain.fee.data.Fee;
import com.drop.domain.fee.dto.FeeCreateDto;
import com.drop.domain.fee.dto.FeeDto;
import com.drop.domain.fee.dto.FeeUpdateDto;
import com.drop.domain.fee.repository.FeeRepository;
import com.drop.domain.user.gym.data.Gym;
import com.drop.domain.user.gym.repository.GymRepository;
import com.drop.domain.user.trainer.data.Trainer;
import com.drop.domain.user.trainer.repository.TrainerRepository;
import com.drop.global.code.error.ErrorCode;
import com.drop.global.code.error.exception.BusinessException;
import com.drop.global.enums.FeeType;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FeeService {
    private ModelMapper modelMapper;

    private final FeeRepository feeRepository;
    private final GymRepository gymRepository;
    private final TrainerRepository trainerRepository;

    public FeeDto createFee(FeeCreateDto feeCreateDto){
        Fee fee = null;
        if(feeCreateDto.getFeeType().equals(FeeType.TRAINER_FEE)) {
            Trainer trainer = trainerRepository.findById(feeCreateDto.getTrainerId()).orElseThrow(() ->
                    new BusinessException(ErrorCode.USER_NOT_EXIST));

            fee = Fee.create(feeCreateDto, trainer);
        } else if (feeCreateDto.getFeeType().equals(FeeType.GYM_FEE)){
            Gym gym = gymRepository.findById(feeCreateDto.getGymId()).orElseThrow(() ->
                    new BusinessException(ErrorCode.USER_NOT_EXIST));

            fee = Fee.create(feeCreateDto, gym);
        }
        
        Fee savedFee = feeRepository.save(fee);

        FeeDto result = modelMapper.map(savedFee, FeeDto.class);
        return result;
    }

    public FeeDto updateFee(FeeUpdateDto feeUpdateDto){
        Fee fee = feeRepository.findById(feeUpdateDto.getFeeId()).orElseThrow(() ->
                new BusinessException(ErrorCode.USER_NOT_EXIST));
        fee.updateFee(feeUpdateDto);
        Fee savedFee = feeRepository.save(fee);

        FeeDto result = modelMapper.map(savedFee, FeeDto.class);
        return result;
    }

    public void deleteFee(Long feeId){
        feeRepository.deleteById(feeId);
    }
}
