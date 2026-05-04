package com.predictive.controller;

import com.predictive.dto.OpenCountDto;
import com.predictive.entity.MaintenanceTicket;
import com.predictive.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private MaintenanceService maintenanceService;

    @GetMapping
    public ResponseEntity<List<MaintenanceTicket>> getAllTickets() {
        return ResponseEntity.ok(maintenanceService.getAllTickets());
    }

    @GetMapping("/open-counts")
    public ResponseEntity<List<OpenCountDto>> getOpenCounts() {
        return ResponseEntity.ok(maintenanceService.getOpenTicketCounts());
    }

    @PostMapping
    public ResponseEntity<MaintenanceTicket> createTicket(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestBody Map<String, Object> body) {
        requireAdmin(role);
        Long assetId = Long.valueOf(body.get("assetId").toString());
        String issueType = body.get("issueType").toString();
        MaintenanceTicket ticket = maintenanceService.createTicket(assetId, issueType);
        return ResponseEntity.ok(ticket);
    }

    private void requireAdmin(String role) {
        if (!"ADMIN".equalsIgnoreCase(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
