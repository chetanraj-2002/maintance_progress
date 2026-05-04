package com.predictive.repository;

import com.predictive.entity.Reading;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ReadingRepository extends JpaRepository<Reading, Long> {

    @Query("SELECT r FROM Reading r WHERE r.sensor.asset.id = :assetId " +
           "AND r.timestamp >= :start AND r.timestamp <= :end " +
           "ORDER BY r.timestamp ASC")
    Page<Reading> findByAssetIdAndTimestampBetween(
            @Param("assetId") Long assetId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable);

    @Query("SELECT r FROM Reading r WHERE r.sensor.asset.id = :assetId ORDER BY r.timestamp ASC")
    Page<Reading> findByAssetId(@Param("assetId") Long assetId, Pageable pageable);

    void deleteBySensor_Asset_Id(Long assetId);
}
