package com.roktodak.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "notifications", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "request_id", "kind"}))
@Getter @Setter
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY) private User user;
    @ManyToOne(fetch = FetchType.LAZY) private BloodRequest request;
    /** MATCH = donor told about a request; RESPONSE = requester told about a donor reply; STATUS = request status change */
    @Column(nullable = false) private String kind;
    @Column(nullable = false, length = 500) private String message;
    private boolean seen;
    private Instant createdAt = Instant.now();
}
