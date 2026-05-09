package com.predictive.controller;

import com.predictive.entity.Reading;
import com.predictive.service.ReadingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/readings")
public class ReadingController {

    @Autowired
    private ReadingService readingService;

    @GetMapping("/recent/{assetId}")
    public ResponseEntity<List<Reading>> getRecentReadings(@PathVariable Long assetId) {
        return ResponseEntity.ok(readingService.getRecentReadings(assetId));
    }
}
