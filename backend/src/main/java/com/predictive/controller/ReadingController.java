package com.predictive.controller;

import com.predictive.entity.Reading;
import com.predictive.service.ReadingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/readings")
public class ReadingController {

    @Autowired
    private ReadingService readingService;

    @GetMapping
    public ResponseEntity<Page<Reading>> getReadings(
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            Pageable pageable) {
        try {
            return ResponseEntity.ok(readingService.getReadings(assetId, start, end, pageable));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        }
    }

    @GetMapping("/recent/{assetId}")
    public ResponseEntity<List<Reading>> getRecentReadings(@PathVariable Long assetId) {
        return ResponseEntity.ok(readingService.getRecentReadings(assetId));
    }

    @GetMapping("/asset/{assetId}/range")
    public ResponseEntity<List<Reading>> getReadingsByAssetAndDateRange(
            @PathVariable Long assetId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        try {
            return ResponseEntity.ok(readingService.getReadingsByAssetAndDateRange(assetId, start, end));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        }
    }

}
