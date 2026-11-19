package com.roktodak.repository;

import com.roktodak.entity.DonorResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DonorResponseRepository extends JpaRepository<DonorResponse, Long> {
    Optional<DonorResponse> findByRequestIdAndDonorId(Long requestId, Long donorId);
    List<DonorResponse> findByRequestIdOrderByCreatedAtAsc(Long requestId);
    List<DonorResponse> findByDonorId(Long donorId);
}
