package com.drop.domain.fee.repository;

import com.drop.domain.fee.data.GymFee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GymFeeRepository extends JpaRepository<GymFee, Long> {
}
