package com.roktodak.controller;

import com.roktodak.dto.Dtos.*;
import com.roktodak.entity.RequestStatus;
import com.roktodak.service.AdminService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/** All /api/admin/** routes require ROLE_ADMIN (enforced in SecurityConfig). */
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService admin;
    public AdminController(AdminService admin) { this.admin = admin; }

    @GetMapping("/stats") public Stats stats() { return admin.stats(); }

    @GetMapping("/users")
    public PageRes<AdminUserRes> users(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return admin.users(page, size);
    }

    @PutMapping("/users/{id}/active")
    public void setActive(Authentication a, @PathVariable Long id, @RequestBody ActiveReq r) { admin.setActive(a.getName(), id, r.active()); }

    @PutMapping("/donors/{profileId}/verify")
    public void verify(Authentication a, @PathVariable Long profileId, @RequestParam(defaultValue = "true") boolean verified) {
        admin.verifyDonor(a.getName(), profileId, verified);
    }

    @GetMapping("/requests")
    public List<RequestRes> requests(@RequestParam(required = false) RequestStatus status) { return admin.requests(status); }

    @PutMapping("/requests/{id}/approve")
    public void approve(Authentication a, @PathVariable Long id) { admin.approve(a.getName(), id); }

    @PutMapping("/requests/{id}/reject")
    public void reject(Authentication a, @PathVariable Long id) { admin.reject(a.getName(), id); }

    @GetMapping("/logs") public List<LogRes> logs() { return admin.logs(); }
}
