package com.dailyhealth.repository;

import com.dailyhealth.entity.User;
import com.dailyhealth.entity.WeightRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeightRecordRepository extends JpaRepository<WeightRecord, Long> {
    List<WeightRecord> findByUserOrderByRecordDateDesc(User user);
    List<WeightRecord> findByUserAndRecordDateBetweenOrderByRecordDateDesc(User user, LocalDate startDate, LocalDate endDate);
    Optional<WeightRecord> findByUserAndRecordDate(User user, LocalDate recordDate);
    Optional<WeightRecord> findTopByUserOrderByRecordDateDesc(User user);
}
