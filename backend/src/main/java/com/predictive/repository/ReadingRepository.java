package com.predictive.repository;

import com.predictive.entity.Reading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReadingRepository extends JpaRepository<Reading, Long> {

    List<Reading> findTop120BySensor_Asset_IdOrderByTimestampDesc(Long assetId);

    void deleteBySensor_Asset_Id(Long assetId);
}
