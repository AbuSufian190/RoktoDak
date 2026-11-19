package com.roktodak.service;

import com.roktodak.dto.Dtos.*;
import com.roktodak.entity.*;
import com.roktodak.exception.ApiException;
import com.roktodak.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/** Every state-changing admin action writes an AdminActivityLog row. */
@Service
public class AdminService {
    private final UserRepository users;
    private final DonorProfileRepository donors;
    private final BloodRequestRepository requests;
    private final AdminActivityLogRepository logs;
    private final RequestService requestService;

    public AdminService(UserRepository users, DonorProfileRepository donors, BloodRequestRepository requests,
                        AdminActivityLogRepository logs, RequestService requestService) {
        this.users = users; this.donors = donors; this.requests = requests; this.logs = logs; this.requestService = requestService;
    }

    @Transactional(readOnly = true)
    public Stats stats() {
        return new Stats(users.count(), users.countByRole(Role.DONOR), donors.countByAvailableTrueAndConsentSearchTrue(),
                requests.count(),
                requests.countByStatus(RequestStatus.ACTIVE) + requests.countByStatus(RequestStatus.PARTIALLY_FULFILLED),
                requests.countByStatus(RequestStatus.FULFILLED), requests.countByStatus(RequestStatus.PENDING));
    }

    @Transactional(readOnly = true)
    public PageRes<AdminUserRes> users(int page, int size) {
        Page<User> p = users.findAll(PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100)));
        List<AdminUserRes> items = p.getContent().stream().map(u -> {
            DonorProfile d = donors.findByUserId(u.getId()).orElse(null);
            return new AdminUserRes(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.isActive(),
                    d == null ? null : d.getId(), d != null && d.isVerified());
        }).toList();
        return new PageRes<>(items, p.getNumber(), p.getTotalPages(), p.getTotalElements());
    }

    @Transactional
    public void setActive(String admin, Long userId, boolean active) {
        User u = users.findById(userId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (u.getRole() == Role.ADMIN) throw new ApiException(HttpStatus.BAD_REQUEST, "Admin accounts cannot be suspended here");
        u.setActive(active);
        log(admin, active ? "REACTIVATE_USER" : "SUSPEND_USER", "USER", userId);
    }

    @Transactional
    public void verifyDonor(String admin, Long profileId, boolean verified) {
        DonorProfile d = donors.findById(profileId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Donor profile not found"));
        d.setVerified(verified);
        log(admin, verified ? "VERIFY_DONOR" : "UNVERIFY_DONOR", "DONOR_PROFILE", profileId);
    }

    @Transactional(readOnly = true)
    public List<RequestRes> requests(RequestStatus status) { return requestService.adminList(status); }

    @Transactional
    public void approve(String admin, Long id) { requestService.approve(id); log(admin, "APPROVE_REQUEST", "BLOOD_REQUEST", id); }

    @Transactional
    public void reject(String admin, Long id) { requestService.reject(id); log(admin, "REJECT_REQUEST", "BLOOD_REQUEST", id); }

    @Transactional(readOnly = true)
    public List<LogRes> logs() {
        return logs.findTop100ByOrderByCreatedAtDesc().stream()
                .map(l -> new LogRes(l.getId(), l.getAdminEmail(), l.getAction(), l.getTargetType(), l.getTargetId(), l.getCreatedAt()))
                .toList();
    }

    private void log(String admin, String action, String type, Long id) {
        AdminActivityLog l = new AdminActivityLog();
        l.setAdminEmail(admin); l.setAction(action); l.setTargetType(type); l.setTargetId(id);
        logs.save(l);
    }
}
