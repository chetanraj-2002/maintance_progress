package com.predictive.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "assets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_name", nullable = false, length = 100)
    private String assetName;

    @Column(name = "location", nullable = false, length = 100)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private AssetStatus status = AssetStatus.HEALTHY;

    public enum AssetStatus {
        HEALTHY, WARNING, NEEDS_ATTEN, ALERT
    }
}
