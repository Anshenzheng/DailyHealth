package com.dailyhealth.service;

import com.dailyhealth.dto.DailyStatistics;
import com.dailyhealth.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatisticsService {

    @Autowired
    private MealRecordService mealRecordService;

    @Autowired
    private ExerciseRecordService exerciseRecordService;

    public DailyStatistics getDailyStatistics(User user, LocalDate date) {
        Integer caloriesIntake = mealRecordService.getTotalCaloriesByDate(user, date);
        Integer caloriesBurned = exerciseRecordService.getTotalCaloriesBurnedByDate(user, date);
        
        return new DailyStatistics(date, caloriesIntake, caloriesBurned);
    }

    public List<DailyStatistics> getWeeklyStatistics(User user, LocalDate date) {
        LocalDate startOfWeek = date.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate endOfWeek = startOfWeek.plusDays(6);
        
        return getStatisticsForDateRange(user, startOfWeek, endOfWeek);
    }

    public List<DailyStatistics> getMonthlyStatistics(User user, LocalDate date) {
        LocalDate startOfMonth = date.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = date.with(TemporalAdjusters.lastDayOfMonth());
        
        return getStatisticsForDateRange(user, startOfMonth, endOfMonth);
    }

    private List<DailyStatistics> getStatisticsForDateRange(User user, LocalDate startDate, LocalDate endDate) {
        List<Object[]> intakeData = mealRecordService.getCaloriesByDateGrouped(user, startDate, endDate);
        List<Object[]> burnedData = exerciseRecordService.getCaloriesBurnedByDateGrouped(user, startDate, endDate);
        
        Map<LocalDate, Integer> intakeMap = new HashMap<>();
        Map<LocalDate, Integer> burnedMap = new HashMap<>();
        
        for (Object[] row : intakeData) {
            LocalDate date = (LocalDate) row[0];
            Long total = (Long) row[1];
            intakeMap.put(date, total.intValue());
        }
        
        for (Object[] row : burnedData) {
            LocalDate date = (LocalDate) row[0];
            Long total = (Long) row[1];
            burnedMap.put(date, total.intValue());
        }
        
        List<DailyStatistics> statistics = new ArrayList<>();
        LocalDate current = startDate;
        
        while (!current.isAfter(endDate)) {
            Integer intake = intakeMap.getOrDefault(current, 0);
            Integer burned = burnedMap.getOrDefault(current, 0);
            statistics.add(new DailyStatistics(current, intake, burned));
            current = current.plusDays(1);
        }
        
        return statistics;
    }

    public Map<String, Object> getSummaryStatistics(User user, LocalDate startDate, LocalDate endDate) {
        List<DailyStatistics> statsList = getStatisticsForDateRange(user, startDate, endDate);
        
        int totalIntake = 0;
        int totalBurned = 0;
        int daysWithRecords = 0;
        
        for (DailyStatistics stats : statsList) {
            totalIntake += stats.getTotalCaloriesIntake();
            totalBurned += stats.getTotalCaloriesBurned();
            if (stats.getTotalCaloriesIntake() > 0 || stats.getTotalCaloriesBurned() > 0) {
                daysWithRecords++;
            }
        }
        
        int totalDays = statsList.size();
        double avgIntake = totalDays > 0 ? (double) totalIntake / totalDays : 0;
        double avgBurned = totalDays > 0 ? (double) totalBurned / totalDays : 0;
        int totalBalance = totalIntake - totalBurned;
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalIntake", totalIntake);
        summary.put("totalBurned", totalBurned);
        summary.put("totalBalance", totalBalance);
        summary.put("avgIntake", Math.round(avgIntake * 100.0) / 100.0);
        summary.put("avgBurned", Math.round(avgBurned * 100.0) / 100.0);
        summary.put("totalDays", totalDays);
        summary.put("daysWithRecords", daysWithRecords);
        summary.put("dailyStats", statsList);
        
        return summary;
    }
}
