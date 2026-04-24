package com.dailyhealth.service;

import com.dailyhealth.entity.User;
import com.dailyhealth.entity.WeightRecord;
import com.dailyhealth.repository.WeightRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class WeightRecordService {

    @Autowired
    private WeightRecordRepository weightRecordRepository;

    public List<WeightRecord> getAll(User user) {
        return weightRecordRepository.findByUserOrderByRecordDateDesc(user);
    }

    public List<WeightRecord> getByDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return weightRecordRepository.findByUserAndRecordDateBetweenOrderByRecordDateDesc(user, startDate, endDate);
    }

    public Optional<WeightRecord> findById(Long id) {
        return weightRecordRepository.findById(id);
    }

    public Optional<WeightRecord> getLatest(User user) {
        return weightRecordRepository.findTopByUserOrderByRecordDateDesc(user);
    }

    @Transactional
    public WeightRecord create(WeightRecord weightRecord, User user) {
        Optional<WeightRecord> existing = weightRecordRepository.findByUserAndRecordDate(user, weightRecord.getRecordDate());
        if (existing.isPresent()) {
            throw new RuntimeException("该日期已有体重记录");
        }
        weightRecord.setUser(user);
        return weightRecordRepository.save(weightRecord);
    }

    @Transactional
    public WeightRecord update(Long id, WeightRecord weightRecord, User user) {
        WeightRecord existing = weightRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("记录不存在"));
        
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权修改此记录");
        }
        
        existing.setRecordDate(weightRecord.getRecordDate());
        existing.setWeight(weightRecord.getWeight());
        existing.setBodyFat(weightRecord.getBodyFat());
        existing.setMuscleMass(weightRecord.getMuscleMass());
        existing.setNotes(weightRecord.getNotes());
        
        return weightRecordRepository.save(existing);
    }

    @Transactional
    public void delete(Long id, User user) {
        WeightRecord existing = weightRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("记录不存在"));
        
        if (!existing.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("无权删除此记录");
        }
        
        weightRecordRepository.delete(existing);
    }
}
