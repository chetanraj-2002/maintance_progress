package com.predictive.controller;

import com.predictive.dto.OpenCountDto;
import com.predictive.entity.MaintenanceTicket;
import com.predictive.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<MaintenanceTicket> createTicket(@RequestBody Map<String, Object> body) {
        Long assetId = Long.valueOf(body.get("assetId").toString());
        String issueType = body.get("issueType").toString();
        MaintenanceTicket ticket = maintenanceService.createTicket(assetId, issueType);
        return ResponseEntity.ok(ticket);
    }

    /** Closing a ticket is allowed for any logged-in user (Viewer + Admin). */
    @PatchMapping("/{id}/close")
    public ResponseEntity<MaintenanceTicket> closeTicket(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(maintenanceService.closeTicket(id));
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Deleting a ticket is admin-only (enforced by SecurityConfig). */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        try {
            maintenanceService.deleteTicket(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
