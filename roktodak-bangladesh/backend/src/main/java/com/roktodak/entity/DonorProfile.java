package com.roktodak.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "donor_profiles", indexes = {
        @Index(name = "idx_donor_search", columnList = "blood_group,district,available")})
@Getter @Setter
public class DonorProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(optional = false, fetch = FetchType.LAZY) @JoinColumn(unique = true)
    private User user;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private BloodGroup bloodGroup;
    @Column(nullable = false) private String division;
    @Column(nullable = false) private String district;
    private String upazila;
    private LocalDate dateOfBirth;
    private LocalDate lastDonationDate;
    private boolean available = true;
    private boolean consentSearch;
    private boolean shareLastDonation;
    private boolean verified;
    private Instant updatedAt = Instant.now();
}
