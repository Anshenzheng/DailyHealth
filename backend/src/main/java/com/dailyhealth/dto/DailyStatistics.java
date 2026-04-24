package com.dailyhealth.dto;

import java.time.LocalDate;

public class DailyStatistics {

    private LocalDate date;
    private Integer totalCaloriesIntake;
    private Integer totalCaloriesBurned;
    private Integer calorieBalance;
    private Integer mealCount;
    private Integer exerciseCount;

    public DailyStatistics() {
    }

    public DailyStatistics(LocalDate date, Integer totalCaloriesIntake, Integer totalCaloriesBurned) {
        this.date = date;
        this.totalCaloriesIntake = totalCaloriesIntake != null ? totalCaloriesIntake : 0;
        this.totalCaloriesBurned = totalCaloriesBurned != null ? totalCaloriesBurned : 0;
        this.calorieBalance = this.totalCaloriesIntake - this.totalCaloriesBurned;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Integer getTotalCaloriesIntake() {
        return totalCaloriesIntake;
    }

    public void setTotalCaloriesIntake(Integer totalCaloriesIntake) {
        this.totalCaloriesIntake = totalCaloriesIntake;
    }

    public Integer getTotalCaloriesBurned() {
        return totalCaloriesBurned;
    }

    public void setTotalCaloriesBurned(Integer totalCaloriesBurned) {
        this.totalCaloriesBurned = totalCaloriesBurned;
    }

    public Integer getCalorieBalance() {
        return calorieBalance;
    }

    public void setCalorieBalance(Integer calorieBalance) {
        this.calorieBalance = calorieBalance;
    }

    public Integer getMealCount() {
        return mealCount;
    }

    public void setMealCount(Integer mealCount) {
        this.mealCount = mealCount;
    }

    public Integer getExerciseCount() {
        return exerciseCount;
    }

    public void setExerciseCount(Integer exerciseCount) {
        this.exerciseCount = exerciseCount;
    }
}
