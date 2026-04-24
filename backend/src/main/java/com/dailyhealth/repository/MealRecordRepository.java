package com.dailyhealth.repository;

import com.dailyhealth.entity.MealRecord;
import com.dailyhealth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealRecordRepository extends JpaRepository<MealRecord, Long> {
    List<MealRecord> findByUserAndRecordDateOrderByMealTypeAsc(User user, LocalDate recordDate);
    List<MealRecord> findByUserAndRecordDateBetweenOrderByRecordDateDesc(User user, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT SUM(m.calories) FROM MealRecord m WHERE m.user = :user AND m.recordDate = :date")
    Integer sumCaloriesByUserAndDate(@Param("user") User user, @Param("date") LocalDate date);
    
    @Query("SELECT SUM(m.calories) FROM MealRecord m WHERE m.user = :user AND m.recordDate BETWEEN :startDate AND :endDate")
    Integer sumCaloriesByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT m.recordDate, SUM(m.calories) FROM MealRecord m WHERE m.user = :user AND m.recordDate BETWEEN :startDate AND :endDate GROUP BY m.recordDate ORDER BY m.recordDate")
    List<Object[]> sumCaloriesGroupByDate(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
