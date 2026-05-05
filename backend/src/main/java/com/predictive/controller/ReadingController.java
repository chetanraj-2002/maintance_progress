package com.predictive.controller;

import com.predictive.entity.Reading;
import com.predictive.service.ReadingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "200") int size) {
        Page<Reading> readings = readingService.getReadings(assetId, start, end, page, size);
        return ResponseEntity.ok(readings);
    }

    @GetMapping("/recent/{assetId}")
    public ResponseEntity<List<Reading>> getRecentReadings(@PathVariable Long assetId) {
        return ResponseEntity.ok(readingService.getRecentReadings(assetId));
    }
}
