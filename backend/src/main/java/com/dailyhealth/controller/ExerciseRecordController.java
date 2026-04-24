package com.dailyhealth.controller;

import com.dailyhealth.dto.ApiResponse;
import com.dailyhealth.entity.ExerciseRecord;
import com.dailyhealth.entity.User;
import com.dailyhealth.service.AuthService;
import com.dailyhealth.service.ExerciseRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseRecordController {

    @Autowired
    private ExerciseRecordService exerciseRecordService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<?> getByDate(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        List<ExerciseRecord> records = exerciseRecordService.getByDate(user, date);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/range")
    public ResponseEntity<?> getByDateRange(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        List<ExerciseRecord> records = exerciseRecordService.getByDateRange(user, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return exerciseRecordService.findById(id)
                .map(record -> {
                    User user = authService.getCurrentUser(userDetails.getUsername());
                    if (!record.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).body(ApiResponse.error("无权访问此记录"));
                    }
                    return ResponseEntity.ok(ApiResponse.success(record));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ExerciseRecord exerciseRecord) {
        try {
            User user = authService.getCurrentUser(userDetails.getUsername());
            ExerciseRecord created = exerciseRecordService.create(exerciseRecord, user);
            return ResponseEntity.ok(ApiResponse.success("记录创建成功", created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody ExerciseRecord exerciseRecord) {
        try {
            User user = authService.getCurrentUser(userDetails.getUsername());
            ExerciseRecord updated = exerciseRecordService.update(id, exerciseRecord, user);
            return ResponseEntity.ok(ApiResponse.success("记录更新成功", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        try {
            User user = authService.getCurrentUser(userDetails.getUsername());
            exerciseRecordService.delete(id, user);
            return ResponseEntity.ok(ApiResponse.success("记录删除成功", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
