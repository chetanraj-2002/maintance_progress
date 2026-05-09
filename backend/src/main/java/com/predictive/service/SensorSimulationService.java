package com.predictive.service;

import com.predictive.entity.Asset;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class SensorSimulationService {

    private final MaintenanceService maintenanceService;
    private final ReadingService readingService;

    @Value("${simulation.enabled:true}")
    private boolean enabled;

    public SensorSimulationService(MaintenanceService maintenanceService, ReadingService readingService) {
        this.maintenanceService = maintenanceService;
        this.readingService = readingService;
    }

    @Scheduled(fixedRateString = "${simulation.fixed-rate-ms:3000}", initialDelayString = "${simulation.initial-delay-ms:3000}")
    public void publishSensorFrame() {
        if (!enabled) return;

        List<Asset> assets = maintenanceService.getAllAssets();
        LocalDateTime capturedAt = LocalDateTime.now();
        for (Asset asset : assets) {
            SensorFrame frame = buildFrame();
            readingService.saveReading(asset.getId(), frame.rms(), frame.temperature(), capturedAt);
        }
    }

    private SensorFrame buildFrame() {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        double rms = random.nextDouble(2.0, 9.4);
        double temperature = random.nextDouble(42.0, 77.0);

        if (random.nextDouble() < 0.18) {
            rms = random.nextDouble(10.1, 14.5);
        }

        if (random.nextDouble() < 0.16) {
            temperature = random.nextDouble(80.5, 96.0);
        }

        return new SensorFrame(round(rms), round(temperature));
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private record SensorFrame(double rms, double temperature) {
    }
}
