package com.predictive.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Asset asset;

    @Column(name = "issue_type", nullable = false, length = 50)
    private String issueType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public enum TicketStatus {
        OPEN, CLOSED
    }

    public static final String ISSUE_RMS_OVER  = "RMS_OVER_THRESHOLD";
    public static final String ISSUE_TEMP_OVER = "TEMP_OVER_THRESHOLD";
    public static final String ISSUE_BOTH_OVER = "RMS_AND_TEMP_OVER_THRESHOLD";
}
