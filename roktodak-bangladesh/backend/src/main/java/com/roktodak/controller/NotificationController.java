package com.roktodak.controller;

import com.roktodak.dto.Dtos.NotificationRes;
import com.roktodak.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;
    public NotificationController(NotificationService service) { this.service = service; }

    @GetMapping public List<NotificationRes> mine(Authentication a) { return service.mine(a.getName()); }

    @GetMapping("/unread-count") public Map<String, Long> unread(Authentication a) { return service.unread(a.getName()); }

    @PutMapping("/{id}/read") public void read(Authentication a, @PathVariable Long id) { service.markSeen(a.getName(), id); }
}
