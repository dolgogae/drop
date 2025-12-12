package com.drop.domain.place.repository;

import com.drop.domain.place.data.RegisteredGym;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegisteredGymRepository extends JpaRepository<RegisteredGym, Long> {

    List<RegisteredGym> findByUserId(Long userId);

    Optional<RegisteredGym> findByUserIdAndKakaoPlaceId(Long userId, String kakaoPlaceId);

    boolean existsByUserIdAndKakaoPlaceId(Long userId, String kakaoPlaceId);

    List<RegisteredGym> findByUserIdAndIsFavoriteTrue(Long userId);
}
