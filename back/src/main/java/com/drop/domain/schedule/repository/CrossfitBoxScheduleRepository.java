package com.drop.domain.schedule.repository;

import com.drop.domain.schedule.data.CrossfitBoxSchedule;
import com.drop.global.enums.DayOfWeek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CrossfitBoxScheduleRepository extends JpaRepository<CrossfitBoxSchedule, Long> {

    @Query("SELECT s FROM CrossfitBoxSchedule s " +
           "LEFT JOIN FETCH s.timeSlots " +
           "WHERE s.crossfitBox.id = :crossfitBoxId " +
           "ORDER BY s.dayOfWeek")
    List<CrossfitBoxSchedule> findByCrossfitBoxIdWithTimeSlots(@Param("crossfitBoxId") Long crossfitBoxId);

    List<CrossfitBoxSchedule> findByCrossfitBoxId(Long crossfitBoxId);

    Optional<CrossfitBoxSchedule> findByCrossfitBoxIdAndDayOfWeek(Long crossfitBoxId, DayOfWeek dayOfWeek);

    List<CrossfitBoxSchedule> findByCrossfitBoxIdAndDayOfWeekIn(Long crossfitBoxId, List<DayOfWeek> dayOfWeeks);

    void deleteByCrossfitBoxId(Long crossfitBoxId);
}
