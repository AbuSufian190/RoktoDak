package com.roktodak.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "donor_responses", uniqueConstraints = @UniqueConstraint(columnNames = {"request_id", "donor_id"}))
@Getter @Setter
public class DonorResponse {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY) private BloodRequest request;
    @ManyToOne(optional = false, fetch = FetchType.LAZY) private User donor;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private ResponseStatus status;
    private Instant createdAt = Instant.now();
}
