package com.drop.domain.user.trainer.repository;

import com.drop.domain.user.trainer.data.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainerRepository extends JpaRepository<Trainer, Long> {
}
