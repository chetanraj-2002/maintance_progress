package com.predictive.service;

import com.predictive.entity.Reading;
import com.predictive.entity.Sensor;
import com.predictive.repository.ReadingRepository;
import com.predictive.repository.SensorRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
