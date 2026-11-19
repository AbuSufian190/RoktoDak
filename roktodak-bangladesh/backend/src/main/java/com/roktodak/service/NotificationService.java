package com.roktodak.service;

import com.roktodak.dto.Dtos.NotificationRes;
import com.roktodak.entity.BloodRequest;
import com.roktodak.entity.Notification;
import com.roktodak.entity.User;
import com.roktodak.exception.ApiException;
import com.roktodak.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

/** In-app notifications only. Email/SMS can be added later by extending {@link #notify}. */
@Service
public class NotificationService {
    private final NotificationRepository repo;
    private final UserLookup lookup;

    public NotificationService(NotificationRepository repo, UserLookup lookup) { this.repo = repo; this.lookup = lookup; }

    /** One notification per (user, request, kind): repeated calls never spam the same person. */
    @Transactional
    public boolean notify(User user, BloodRequest request, String kind, String message) {
        if (request != null && repo.existsByUserIdAndRequestIdAndKind(user.getId(), request.getId(), kind)) return false;
        Notification n = new Notification();
        n.setUser(user); n.setRequest(request); n.setKind(kind); n.setMessage(message);
        repo.save(n);
        return true;
    }

    @Transactional(readOnly = true)
    public List<NotificationRes> mine(String email) {
        User u = lookup.byEmail(email);
        return repo.findTop50ByUserIdOrderByCreatedAtDesc(u.getId()).stream()
                .map(n -> new NotificationRes(n.getId(), n.getMessage(),
                        n.getRequest() == null ? null : n.getRequest().getId(), n.isSeen(), n.getCreatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Long> unread(String email) {
        return Map.of("unread", repo.countByUserIdAndSeenFalse(lookup.byEmail(email).getId()));
    }

    @Transactional
    public void markSeen(String email, Long id) {
        User u = lookup.byEmail(email);
        Notification n = repo.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (!n.getUser().getId().equals(u.getId())) throw new ApiException(HttpStatus.FORBIDDEN, "Not your notification");
        n.setSeen(true);
    }
}
