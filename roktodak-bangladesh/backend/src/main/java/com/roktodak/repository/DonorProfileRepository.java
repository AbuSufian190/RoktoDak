package com.roktodak.repository;

import com.roktodak.entity.BloodGroup;
import com.roktodak.entity.DonorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;
import java.util.Optional;

public interface DonorProfileRepository extends JpaRepository<DonorProfile, Long>, JpaSpecificationExecutor<DonorProfile> {
    Optional<DonorProfile> findByUserId(Long userId);
    List<DonorProfile> findByBloodGroupAndDistrictAndAvailableTrueAndConsentSearchTrue(BloodGroup bg, String district);
    long countByAvailableTrueAndConsentSearchTrue();
}
