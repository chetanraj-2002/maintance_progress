package com.predictive.service;

import com.predictive.entity.Reading;
import com.predictive.entity.Sensor;
import com.predictive.repository.ReadingRepository;
import com.predictive.repository.SensorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

    public Page<Reading> getReadings(Long assetId, LocalDateTime start, LocalDateTime end, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (assetId == null) {
            return readingRepository.findAll(pageable);
        }
        if (start != null && end != null) {
            return readingRepository.findByAssetIdAndTimestampBetween(assetId, start, end, pageable);
        }
        return readingRepository.findByAssetId(assetId, pageable);
    }

    public List<Reading> getRecentReadings(Long assetId) {
        List<Reading> readings = readingRepository.findTop120BySensor_Asset_IdOrderByTimestampDesc(assetId);
        Collections.reverse(readings);
        return readings;
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
        maintenanceService.evaluateThresholds(assetId, rms, temperature);
        return saved;
    }
}
