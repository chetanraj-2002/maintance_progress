package com.predictive.service;

import com.predictive.dto.OpenCountDto;
import com.predictive.dto.ThresholdDto;
import com.predictive.entity.*;
import com.predictive.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MaintenanceService {

    @Autowired private AssetRepository assetRepository;
    @Autowired private ThresholdRepository thresholdRepository;
    @Autowired private MaintenanceTicketRepository ticketRepository;
    @Autowired private SensorRepository sensorRepository;
    @Autowired private ReadingRepository readingRepository;

    @Transactional
    public void evaluateThresholds(Long assetId, double rms, double temperature) {
        Optional<Threshold> thresholdOpt = thresholdRepository.findByAssetId(assetId);
        if (thresholdOpt.isEmpty()) return;

        Threshold threshold = thresholdOpt.get();
        boolean rmsOver  = rms > threshold.getRmsMax();
        boolean tempOver = temperature > threshold.getTempMax();
        boolean rmsWarn = rms > threshold.getRmsMax() * 0.85;
        boolean tempWarn = temperature > threshold.getTempMax() * 0.85;

        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found: " + assetId));

        if (!rmsOver && !tempOver) {
            long openTickets = ticketRepository.countByAsset_IdAndStatus(assetId, MaintenanceTicket.TicketStatus.OPEN);
            if (openTickets > 0) {
                asset.setStatus(Asset.AssetStatus.NEEDS_ATTEN);
            } else if (rmsWarn || tempWarn) {
                asset.setStatus(Asset.AssetStatus.WARNING);
            } else {
                asset.setStatus(Asset.AssetStatus.HEALTHY);
            }
            assetRepository.save(asset);
            return;
        }

        String issueType;
        if (rmsOver && tempOver) {
            issueType = MaintenanceTicket.ISSUE_BOTH_OVER;
        } else if (rmsOver) {
            issueType = MaintenanceTicket.ISSUE_RMS_OVER;
        } else {
            issueType = MaintenanceTicket.ISSUE_TEMP_OVER;
        }

        asset.setStatus(rms > threshold.getRmsMax() * 1.2 || temperature > threshold.getTempMax() * 1.15
                ? Asset.AssetStatus.ALERT
                : Asset.AssetStatus.NEEDS_ATTEN);
        assetRepository.save(asset);

        boolean openTicketExists = ticketRepository.existsByAsset_IdAndIssueTypeAndStatus(
                assetId, issueType, MaintenanceTicket.TicketStatus.OPEN);
        if (openTicketExists) return;

        MaintenanceTicket ticket = new MaintenanceTicket();
        ticket.setAsset(asset);
        ticket.setIssueType(issueType);
        ticket.setStatus(MaintenanceTicket.TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
    }

    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    public Optional<Asset> getAssetById(Long id) {
        return assetRepository.findById(id);
    }

    @Transactional
    public Asset createAsset(Asset request) {
        Asset asset = new Asset();
        asset.setAssetName(cleanRequired(request.getAssetName(), "Asset name"));
        asset.setLocation(cleanRequired(request.getLocation(), "Location"));
        asset.setStatus(request.getStatus() != null ? request.getStatus() : Asset.AssetStatus.HEALTHY);

        Asset saved = assetRepository.save(asset);

        Sensor sensor = new Sensor();
        sensor.setId(sensorRepository.findMaxId() + 1);
        sensor.setAsset(saved);
        sensor.setSensorType("VIBRATION");
        sensor.setUnit("g");
        sensorRepository.save(sensor);

        Threshold threshold = new Threshold();
        threshold.setId(thresholdRepository.findMaxId() + 1);
        threshold.setAsset(saved);
        threshold.setRmsMax(10.0);
        threshold.setTempMax(80.0);
        thresholdRepository.save(threshold);

        return saved;
    }

    @Transactional
    public Asset updateAsset(Long id, Asset request) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found: " + id));

        asset.setAssetName(cleanRequired(request.getAssetName(), "Asset name"));
        asset.setLocation(cleanRequired(request.getLocation(), "Location"));
        if (request.getStatus() != null) {
            asset.setStatus(request.getStatus());
        }

        return assetRepository.save(asset);
    }

    @Transactional
    public void deleteAsset(Long id) {
        if (!assetRepository.existsById(id)) {
            throw new RuntimeException("Asset not found: " + id);
        }

        ticketRepository.deleteByAsset_Id(id);
        readingRepository.deleteBySensor_Asset_Id(id);
        thresholdRepository.deleteByAsset_Id(id);
        sensorRepository.deleteByAsset_Id(id);
        assetRepository.deleteById(id);
    }

    public Optional<Threshold> getThresholdByAssetId(Long assetId) {
        return thresholdRepository.findByAssetId(assetId);
    }

    @Transactional
    public Threshold saveOrUpdateThreshold(ThresholdDto dto) {
        Asset asset = assetRepository.findById(dto.getAssetId())
                .orElseThrow(() -> new RuntimeException("Asset not found: " + dto.getAssetId()));

        Optional<Threshold> existing = thresholdRepository.findByAssetId(dto.getAssetId());
        Threshold threshold;
        if (existing.isPresent()) {
            threshold = existing.get();
            threshold.setRmsMax(dto.getRmsMax());
            threshold.setTempMax(dto.getTempMax());
        } else {
            threshold = new Threshold();
            long maxId = thresholdRepository.count() + 1;
            threshold.setId(maxId);
            threshold.setAsset(asset);
            threshold.setRmsMax(dto.getRmsMax());
            threshold.setTempMax(dto.getTempMax());
        }
        return thresholdRepository.save(threshold);
    }

    public List<MaintenanceTicket> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<OpenCountDto> getOpenTicketCounts() {
        return ticketRepository.findOpenCountsGroupedByAsset();
    }

    @Transactional
    public MaintenanceTicket createTicket(Long assetId, String issueType) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found: " + assetId));
        MaintenanceTicket ticket = new MaintenanceTicket();
        ticket.setAsset(asset);
        ticket.setIssueType(issueType);
        ticket.setStatus(MaintenanceTicket.TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    private String cleanRequired(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        return value.trim();
    }
}
