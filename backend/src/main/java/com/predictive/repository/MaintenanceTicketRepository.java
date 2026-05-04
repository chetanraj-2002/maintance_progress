package com.predictive.repository;

import com.predictive.dto.OpenCountDto;
import com.predictive.entity.MaintenanceTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceTicketRepository extends JpaRepository<MaintenanceTicket, Long> {

    @Query("SELECT new com.predictive.dto.OpenCountDto(t.asset.id, t.asset.assetName, COUNT(t)) " +
            "FROM MaintenanceTicket t WHERE t.status = 'OPEN' " +
            "GROUP BY t.asset.id, t.asset.assetName")
    List<OpenCountDto> findOpenCountsGroupedByAsset();

    List<MaintenanceTicket> findAllByOrderByCreatedAtDesc();

    void deleteByAsset_Id(Long assetId);
}
