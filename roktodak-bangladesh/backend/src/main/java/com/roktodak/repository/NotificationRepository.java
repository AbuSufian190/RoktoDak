package com.roktodak.repository;

import com.roktodak.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop50ByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByUserIdAndRequestIdAndKind(Long userId, Long requestId, String kind);
    long countByUserIdAndSeenFalse(Long userId);
}
