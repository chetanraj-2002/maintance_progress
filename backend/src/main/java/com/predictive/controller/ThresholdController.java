package com.predictive.controller;

import com.predictive.dto.ThresholdDto;
import com.predictive.entity.Threshold;
import com.predictive.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/thresholds")
public class ThresholdController {

    @Autowired
    private MaintenanceService maintenanceService;

    @GetMapping("/{assetId}")
    public ResponseEntity<Threshold> getThresholdByAssetId(@PathVariable Long assetId) {
        return maintenanceService.getThresholdByAssetId(assetId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Threshold> createOrUpdateThreshold(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestBody ThresholdDto dto) {
        requireAdmin(role);
        Threshold saved = maintenanceService.saveOrUpdateThreshold(dto);
        return ResponseEntity.ok(saved);
    }

    private void requireAdmin(String role) {
        if (!"ADMIN".equalsIgnoreCase(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
