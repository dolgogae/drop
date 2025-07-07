package com.drop.domain.fee.repository;

import com.drop.domain.fee.data.Fee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeeRepository extends JpaRepository<Fee, Long> {
}
