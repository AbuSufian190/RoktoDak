package com.roktodak.repository;

import com.roktodak.entity.AdminActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdminActivityLogRepository extends JpaRepository<AdminActivityLog, Long> {
    List<AdminActivityLog> findTop100ByOrderByCreatedAtDesc();
}
