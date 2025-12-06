package com.drop.domain.user.trainer.service;

import com.drop.domain.user.trainer.data.Trainer;
import com.drop.domain.user.trainer.dto.TrainerCreateDto;
import com.drop.domain.user.trainer.dto.TrainerDto;
import com.drop.domain.user.trainer.mapper.TrainerMapper;
import com.drop.domain.user.trainer.repository.TrainerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrainerService {
    private final TrainerRepository trainerRepository;
    private final TrainerMapper trainerMapper;

    @Transactional
    public TrainerDto creatTrainer(TrainerCreateDto trainerCreateDto){
        Trainer trainer = Trainer.create(trainerCreateDto);
        Trainer savedTrainer = trainerRepository.save(trainer);

        return trainerMapper.toDto(savedTrainer);
    }
}
