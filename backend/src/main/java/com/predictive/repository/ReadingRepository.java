package com.predictive.repository;

import com.predictive.entity.Reading;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReadingRepository extends JpaRepository<Reading, Long> {

    List<Reading> findTop120BySensor_Asset_IdOrderByTimestampDesc(Long assetId);

    Page<Reading> findBySensor_Asset_Id(Long assetId, Pageable pageable);

    Page<Reading> findByTimestampBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<Reading> findBySensor_Asset_IdAndTimestampBetween(Long assetId, LocalDateTime start, LocalDateTime end, Pageable pageable);

    List<Reading> findBySensor_Asset_IdAndTimestampBetweenOrderByTimestampAsc(Long assetId, LocalDateTime start, LocalDateTime end);

    void deleteBySensor_Asset_Id(Long assetId);
}
