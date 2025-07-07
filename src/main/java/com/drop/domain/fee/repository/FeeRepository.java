package com.drop.domain.fee.repository;

import com.drop.domain.fee.data.TrainerFee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeeRepository extends JpaRepository<TrainerFee, Long> {
}
