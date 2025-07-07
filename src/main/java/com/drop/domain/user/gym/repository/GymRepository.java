package com.drop.domain.user.gym.repository;

import com.drop.domain.user.gym.data.Gym;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GymRepository extends JpaRepository<Gym, Long> {
}
