package com.dailyhealth.repository;

import com.dailyhealth.entity.ExerciseRecord;
import com.dailyhealth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExerciseRecordRepository extends JpaRepository<ExerciseRecord, Long> {
    List<ExerciseRecord> findByUserAndRecordDateOrderByCreatedAtDesc(User user, LocalDate recordDate);
    List<ExerciseRecord> findByUserAndRecordDateBetweenOrderByRecordDateDesc(User user, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT SUM(e.caloriesBurned) FROM ExerciseRecord e WHERE e.user = :user AND e.recordDate = :date")
    Integer sumCaloriesBurnedByUserAndDate(@Param("user") User user, @Param("date") LocalDate date);
    
    @Query("SELECT SUM(e.caloriesBurned) FROM ExerciseRecord e WHERE e.user = :user AND e.recordDate BETWEEN :startDate AND :endDate")
    Integer sumCaloriesBurnedByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT e.recordDate, SUM(e.caloriesBurned) FROM ExerciseRecord e WHERE e.user = :user AND e.recordDate BETWEEN :startDate AND :endDate GROUP BY e.recordDate ORDER BY e.recordDate")
    List<Object[]> sumCaloriesBurnedGroupByDate(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
