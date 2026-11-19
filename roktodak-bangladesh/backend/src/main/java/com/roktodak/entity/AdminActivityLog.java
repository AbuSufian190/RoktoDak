package com.roktodak.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "admin_activity_logs")
@Getter @Setter
public class AdminActivityLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String adminEmail;
    @Column(nullable = false) private String action;
    private String targetType;
    private Long targetId;
    private Instant createdAt = Instant.now();
}
