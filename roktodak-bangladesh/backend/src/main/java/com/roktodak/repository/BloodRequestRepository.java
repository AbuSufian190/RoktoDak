package com.roktodak.repository;

import com.roktodak.entity.BloodGroup;
import com.roktodak.entity.BloodRequest;
import com.roktodak.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long>, JpaSpecificationExecutor<BloodRequest> {
    List<BloodRequest> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);
    List<BloodRequest> findByBloodGroupAndDistrictAndStatusInOrderByRequiredAtAsc(BloodGroup bg, String district, Collection<RequestStatus> statuses);
    long countByStatus(RequestStatus status);

    @Modifying
    @Query("update BloodRequest r set r.status = :to where r.status in :from and r.requiredAt < :now")
    int expireOverdue(@Param("to") RequestStatus to, @Param("from") Collection<RequestStatus> from, @Param("now") LocalDateTime now);
}
