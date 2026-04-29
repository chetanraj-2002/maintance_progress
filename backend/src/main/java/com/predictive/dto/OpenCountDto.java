package com.predictive.dto;

public class OpenCountDto {
    private Long assetId;
    private String assetName;
    private Long openCount;

    public OpenCountDto(Long assetId, String assetName, Long openCount) {
        this.assetId = assetId;
        this.assetName = assetName;
        this.openCount = openCount;
    }

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public String getAssetName() { return assetName; }
    public void setAssetName(String assetName) { this.assetName = assetName; }

    public Long getOpenCount() { return openCount; }
    public void setOpenCount(Long openCount) { this.openCount = openCount; }
}
