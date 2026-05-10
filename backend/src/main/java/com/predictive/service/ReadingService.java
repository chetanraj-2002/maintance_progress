package com.predictive.service;

import com.predictive.entity.Reading;
import com.predictive.entity.Sensor;
import com.predictive.repository.ReadingRepository;
import com.predictive.repository.SensorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class ReadingService {

    @Autowired private ReadingRepository readingRepository;
    @Autowired private SensorRepository sensorRepository;
    @Autowired private MaintenanceService maintenanceService;

    public List<Reading> getRecentReadings(Long assetId) {
        List<Reading> readings = readingRepository.findTop120BySensor_Asset_IdOrderByTimestampDesc(assetId);
        Collections.reverse(readings);
        return readings;
    }

    public Page<Reading> getReadings(Long assetId, LocalDateTime start, LocalDateTime end, Pageable pageable) {
        if ((start == null) != (end == null)) {
            throw new IllegalArgumentException("Both start and end date are required when filtering by date range");
        }
        if (start != null) {
            validateRange(start, end);
        }
        if (assetId != null && start != null && end != null) {
            return readingRepository.findBySensor_Asset_IdAndTimestampBetween(assetId, start, end, pageable);
        }
        if (start != null && end != null) {
            return readingRepository.findByTimestampBetween(start, end, pageable);
        }
        if (assetId != null) {
            return readingRepository.findBySensor_Asset_Id(assetId, pageable);
        }
        return readingRepository.findAll(pageable);
    }

    public List<Reading> getReadingsByAssetAndDateRange(Long assetId, LocalDateTime start, LocalDateTime end) {
        validateRange(start, end);
        return readingRepository.findBySensor_Asset_IdAndTimestampBetweenOrderByTimestampAsc(assetId, start, end);
    }

    @Transactional
    public Reading saveReading(Long assetId, double rms, double temperature, LocalDateTime timestamp) {
        Sensor sensor = sensorRepository.findByAssetId(assetId)
                .orElseThrow(() -> new RuntimeException("Sensor not found for asset: " + assetId));
        Reading reading = new Reading();
        reading.setSensor(sensor);
        reading.setRms(rms);
        reading.setTemperature(temperature);
        reading.setTimestamp(timestamp != null ? timestamp : LocalDateTime.now());
        Reading saved = readingRepository.save(reading);
        maintenanceService.evaluateThreshold(assetId, rms, temperature);
        return saved;
    }

    private void validateRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end date are required");
        }
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End date must be after start date");
        }
    }
}
