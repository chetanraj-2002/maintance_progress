package com.predictive.dto;

public class ThresholdDto {
    private Long assetId;
    private Double rmsMax;
    private Double tempMax;

    public ThresholdDto() {}

    public ThresholdDto(Long assetId, Double rmsMax, Double tempMax) {
        this.assetId = assetId;
        this.rmsMax = rmsMax;
        this.tempMax = tempMax;
    }

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public Double getRmsMax() { return rmsMax; }
    public void setRmsMax(Double rmsMax) { this.rmsMax = rmsMax; }

    public Double getTempMax() { return tempMax; }
    public void setTempMax(Double tempMax) { this.tempMax = tempMax; }
}
