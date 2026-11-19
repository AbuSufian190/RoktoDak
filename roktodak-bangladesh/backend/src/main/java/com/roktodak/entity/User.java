package com.roktodak.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "users")
@Getter @Setter
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String fullName;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) private String passwordHash;
    private String phone;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role;
    private boolean active = true;
    private String language = "bn";
    private Instant createdAt = Instant.now();
}
