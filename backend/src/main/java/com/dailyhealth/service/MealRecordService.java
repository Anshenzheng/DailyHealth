package com.dailyhealth.service;

import com.dailyhealth.entity.MealRecord;
import com.dailyhealth.entity.User;
import com.dailyhealth.repository.MealRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class MealRecordService {

    @Autowired
    private MealRecordRepository mealRecordRepository;

    public List<MealRecord> getByDate(User user, LocalDate date) {
        return mealRecordRepository.findByUserAndRecordDateOrderByMealTypeAsc(user, date);
    }

    public List<MealRecord> getByDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return mealRecordRepository.findByUserAndRecordDateBetweenOrderByRecordDateDesc(user, startDate, endDate);
    }

    public Optional<MealRecord> findById(Long id) {
        return mealRecordRepository.findById(id);
    }

    @Transactional
    public MealRecord create(MealRecord mealRecord, User user) {
        mealRecord.setUser(user);
        return mealRecordRepository.save(mealRecord);
    }

    @Transactional
    public MealRecord update(Long id, MealRecord mealRecord, User user) {
        MealRecord existing = mealRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("记录不存在"));
        
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权修改此记录");
        }
        
        existing.setRecordDate(mealRecord.getRecordDate());
        existing.setMealType(mealRecord.getMealType());
        existing.setFoodName(mealRecord.getFoodName());
        existing.setCalories(mealRecord.getCalories());
        existing.setProtein(mealRecord.getProtein());
        existing.setCarbs(mealRecord.getCarbs());
        existing.setFat(mealRecord.getFat());
        existing.setNotes(mealRecord.getNotes());
        
        return mealRecordRepository.save(existing);
    }

    @Transactional
    public void delete(Long id, User user) {
        MealRecord existing = mealRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("记录不存在"));
        
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权删除此记录");
        }
        
        mealRecordRepository.delete(existing);
    }

    public Integer getTotalCaloriesByDate(User user, LocalDate date) {
        Integer total = mealRecordRepository.sumCaloriesByUserAndDate(user, date);
        return total != null ? total : 0;
    }

    public Integer getTotalCaloriesByDateRange(User user, LocalDate startDate, LocalDate endDate) {
        Integer total = mealRecordRepository.sumCaloriesByUserAndDateRange(user, startDate, endDate);
        return total != null ? total : 0;
    }

    public List<Object[]> getCaloriesByDateGrouped(User user, LocalDate startDate, LocalDate endDate) {
        return mealRecordRepository.sumCaloriesGroupByDate(user, startDate, endDate);
    }
}
