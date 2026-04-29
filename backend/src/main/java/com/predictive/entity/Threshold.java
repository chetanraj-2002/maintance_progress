package com.predictive.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "thresholds")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Threshold {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Asset asset;

    @Column(name = "rms_max", nullable = false)
    private Double rmsMax;

    @Column(name = "temp_max", nullable = false)
    private Double tempMax;
}
