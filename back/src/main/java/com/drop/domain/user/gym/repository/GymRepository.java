package com.drop.domain.user.gym.repository;

import com.drop.domain.user.gym.data.Gym;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GymRepository extends JpaRepository<Gym, Long> {

    @Query("SELECT g FROM Gym g WHERE g.latitude IS NOT NULL AND g.longitude IS NOT NULL")
    List<Gym> findAllWithLocation();

    @Query("SELECT g FROM Gym g WHERE g.latitude IS NOT NULL AND g.longitude IS NOT NULL " +
           "AND g.latitude BETWEEN :swLat AND :neLat " +
           "AND g.longitude BETWEEN :swLng AND :neLng")
    List<Gym> findByBounds(@Param("swLat") Double swLat,
                           @Param("swLng") Double swLng,
                           @Param("neLat") Double neLat,
                           @Param("neLng") Double neLng);
}
