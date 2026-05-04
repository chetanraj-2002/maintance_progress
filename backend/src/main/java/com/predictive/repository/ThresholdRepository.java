package com.predictive.repository;

import com.predictive.entity.Threshold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThresholdRepository extends JpaRepository<Threshold, Long> {

    // BUG FIX: was "findByAssetId" but the field is "asset" (an Asset object).
    // The correct Spring Data derived query name is findByAsset_Id.
    @Query("SELECT t FROM Threshold t WHERE t.asset.id = :assetId")
    Optional<Threshold> findByAssetId(@Param("assetId") Long assetId);

    @Query("SELECT COALESCE(MAX(t.id), 0) FROM Threshold t")
    Long findMaxId();

    void deleteByAsset_Id(Long assetId);
}
