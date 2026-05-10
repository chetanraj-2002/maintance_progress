package com.predictive.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThresholdDto {
    private Long assetId;
    private Double rmsMax;
    private Double tempMax;
}
