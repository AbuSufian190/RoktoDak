package com.roktodak.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "blood_requests", indexes = {
        @Index(name = "idx_request_status", columnList = "status,blood_group,district")})
@Getter @Setter
public class BloodRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY) private User requester;
    @Column(nullable = false) private String patientName;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private BloodGroup bloodGroup;
    private int units;
    @Column(nullable = false) private String hospitalName;
    @Column(nullable = false) private String hospitalAddress;
    @Column(nullable = false) private String division;
    @Column(nullable = false) private String district;
    private String upazila;
    @Column(nullable = false) private LocalDateTime requiredAt;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Urgency urgency;
    @Column(nullable = false) private String contactPhone;
    @Column(length = 1000) private String notes;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private RequestStatus status = RequestStatus.PENDING;
    private Instant createdAt = Instant.now();
}
