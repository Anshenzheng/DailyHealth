package com.dailyhealth.service;

import com.dailyhealth.entity.ExerciseRecord;
import com.dailyhealth.entity.User;
import com.dailyhealth.repository.ExerciseRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ExerciseRecordService {

    @Autowired
    private ExerciseRecordRepository exerciseRecordRepository;

    public List<ExerciseRecord> getByDate(User user, LocalDate date) {
        return exerciseRecordRepository.findByUserAndRecordDateOrderByCreatedAtDesc(user, date);
    }

    public List<ExerciseRecord> getByDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return exerciseRecordRepository.findByUserAndRecordDateBetweenOrderByRecordDateDesc(user, startDate, endDate);
    }

    public Optional<ExerciseRecord> findById(Long id) {
        return exerciseRecordRepository.findById(id);
    }

    @Transactional
    public ExerciseRecord create(ExerciseRecord exerciseRecord, User user) {
        exerciseRecord.setUser(user);
        return exerciseRecordRepository.save(exerciseRecord);
    }

    @Transactional
    public ExerciseRecord update(Long id, ExerciseRecord exerciseRecord, User user) {
        ExerciseRecord existing = exerciseRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("记录不存在"));
        
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权修改此记录");
        }
        
        existing.setRecordDate(exerciseRecord.getRecordDate());
        existing.setExerciseName(exerciseRecord.getExerciseName());
        existing.setExerciseType(exerciseRecord.getExerciseType());
        existing.setDuration(exerciseRecord.getDuration());
        existing.setCaloriesBurned(exerciseRecord.getCaloriesBurned());
        existing.setNotes(exerciseRecord.getNotes());
        
        return exerciseRecordRepository.save(existing);
    }

    @Transactional
    public void delete(Long id, User user) {
        ExerciseRecord existing = exerciseRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("记录不存在"));
        
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权删除此记录");
        }
        
        exerciseRecordRepository.delete(existing);
    }

    public Integer getTotalCaloriesBurnedByDate(User user, LocalDate date) {
        Integer total = exerciseRecordRepository.sumCaloriesBurnedByUserAndDate(user, date);
        return total != null ? total : 0;
    }

    public Integer getTotalCaloriesBurnedByDateRange(User user, LocalDate startDate, LocalDate endDate) {
        Integer total = exerciseRecordRepository.sumCaloriesBurnedByUserAndDateRange(user, startDate, endDate);
        return total != null ? total : 0;
    }

    public List<Object[]> getCaloriesBurnedByDateGrouped(User user, LocalDate startDate, LocalDate endDate) {
        return exerciseRecordRepository.sumCaloriesBurnedGroupByDate(user, startDate, endDate);
    }
}
