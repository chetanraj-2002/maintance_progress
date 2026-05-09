package com.predictive.controller;

import com.predictive.entity.Asset;
import com.predictive.service.MaintenanceService;
import com.predictive.util.RoleCheck;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    @Autowired
    private MaintenanceService maintenanceService;

    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets() {
        return ResponseEntity.ok(maintenanceService.getAllAssets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAssetById(@PathVariable Long id) {
        return maintenanceService.getAssetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Asset> createAsset(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestBody Asset asset) {
        RoleCheck.requireAdmin(role);
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(maintenanceService.createAsset(asset));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asset> updateAsset(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @PathVariable Long id,
            @RequestBody Asset asset) {
        RoleCheck.requireAdmin(role);
        try {
            return ResponseEntity.ok(maintenanceService.updateAsset(id, asset));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @PathVariable Long id) {
        RoleCheck.requireAdmin(role);
        try {
            maintenanceService.deleteAsset(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
