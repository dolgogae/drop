package com.drop.domain.crossfitbox.repository;

import com.drop.domain.crossfitbox.data.CrossfitBox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CrossfitBoxRepository extends JpaRepository<CrossfitBox, Long> {

    Optional<CrossfitBox> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT c FROM CrossfitBox c WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL")
    List<CrossfitBox> findAllWithLocation();

    @Query("SELECT c FROM CrossfitBox c WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL " +
           "AND c.latitude BETWEEN :swLat AND :neLat " +
           "AND c.longitude BETWEEN :swLng AND :neLng")
    List<CrossfitBox> findByBounds(@Param("swLat") Double swLat,
                           @Param("swLng") Double swLng,
                           @Param("neLat") Double neLat,
                           @Param("neLng") Double neLng);

    @Query("SELECT c FROM CrossfitBox c WHERE LOWER(REPLACE(c.name, ' ', '')) LIKE LOWER(CONCAT('%', REPLACE(:keyword, ' ', ''), '%'))")
    List<CrossfitBox> searchByName(@Param("keyword") String keyword);
}
