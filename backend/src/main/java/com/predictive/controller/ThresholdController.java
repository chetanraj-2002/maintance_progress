package com.predictive.controller;

import com.predictive.dto.ThresholdDto;
import com.predictive.entity.Threshold;
import com.predictive.service.MaintenanceService;
import com.predictive.util.RoleCheck;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        RoleCheck.requireAdmin(role);
        Threshold saved = maintenanceService.saveOrUpdateThreshold(dto);
        return ResponseEntity.ok(saved);
    }
}
