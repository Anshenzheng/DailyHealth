package com.dailyhealth.controller;

import com.dailyhealth.dto.ApiResponse;
import com.dailyhealth.dto.DailyStatistics;
import com.dailyhealth.entity.User;
import com.dailyhealth.service.AuthService;
import com.dailyhealth.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @Autowired
    private AuthService authService;

    @GetMapping("/daily")
    public ResponseEntity<?> getDailyStatistics(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        User user = authService.getCurrentUser(userDetails.getUsername());
        DailyStatistics stats = statisticsService.getDailyStatistics(user, date);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/weekly")
    public ResponseEntity<?> getWeeklyStatistics(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        User user = authService.getCurrentUser(userDetails.getUsername());
        List<DailyStatistics> stats = statisticsService.getWeeklyStatistics(user, date);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyStatistics(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        User user = authService.getCurrentUser(userDetails.getUsername());
        List<DailyStatistics> stats = statisticsService.getMonthlyStatistics(user, date);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummaryStatistics(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        Map<String, Object> summary = statisticsService.getSummaryStatistics(user, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
