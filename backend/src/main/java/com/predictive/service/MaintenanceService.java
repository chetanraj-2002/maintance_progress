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

    @Transactional
    public void evaluateThresholds(Long assetId, double rms, double temperature) {
        Optional<Threshold> thresholdOpt = thresholdRepository.findByAssetId(assetId);
        if (thresholdOpt.isEmpty()) return;

        Threshold threshold = thresholdOpt.get();
        boolean rmsOver  = rms > threshold.getRmsMax();
        boolean tempOver = temperature > threshold.getTempMax();

        if (!rmsOver && !tempOver) return;

        String issueType;
        if (rmsOver && tempOver) {
            issueType = MaintenanceTicket.ISSUE_BOTH_OVER;
        } else if (rmsOver) {
            issueType = MaintenanceTicket.ISSUE_RMS_OVER;
        } else {
            issueType = MaintenanceTicket.ISSUE_TEMP_OVER;
        }

        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found: " + assetId));
        asset.setStatus(Asset.AssetStatus.NEEDS_ATTEN);
        assetRepository.save(asset);

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
}
