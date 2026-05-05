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
            SensorFrame frame = buildFrame(asset, capturedAt);
            readingService.saveReading(asset.getId(), frame.rms(), frame.temperature(), capturedAt);
        }
    }

    private SensorFrame buildFrame(Asset asset, LocalDateTime time) {
        double phase = (time.toLocalTime().toSecondOfDay() / 3.0) + asset.getId() * 11.0;
        double cycle = (Math.sin(phase / 14.0) + 1.0) / 2.0;
        double drift = (Math.sin(phase / 47.0) + 1.0) / 2.0;
        double noise = ThreadLocalRandom.current().nextDouble(-0.35, 0.35);

        double rmsBase = 3.0 + asset.getId() * 0.55;
        double tempBase = 48.0 + asset.getId() * 4.0;

        double rms = rmsBase + cycle * 3.8 + drift * 1.4 + noise;
        double temperature = tempBase + cycle * 18.0 + drift * 7.0 + noise * 1.6;

        if (asset.getId() % 3 == 2 && cycle > 0.76) {
            rms += 3.2 + cycle;
            temperature += 7.5 + cycle * 5.0;
        }

        if (asset.getId() % 5 == 0 && drift > 0.62) {
            rms += 5.0 + drift * 2.0;
            temperature += 12.0 + drift * 8.0;
        }

        return new SensorFrame(round(rms), round(temperature));
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private record SensorFrame(double rms, double temperature) {
    }
}
