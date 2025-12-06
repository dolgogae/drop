package com.drop.domain.user.userbase.repository;

import com.drop.domain.user.userbase.data.UserBase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserJpaRepository extends JpaRepository<UserBase, Long> {

    Optional<UserBase> findByEmail(String email);
}
