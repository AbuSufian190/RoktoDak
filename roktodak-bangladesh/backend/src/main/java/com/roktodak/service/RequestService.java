package com.roktodak.service;

import com.roktodak.dto.Dtos.*;
import com.roktodak.entity.*;
import com.roktodak.exception.ApiException;
import com.roktodak.repository.*;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RequestService {
    private static final List<RequestStatus> LIVE = List.of(RequestStatus.ACTIVE, RequestStatus.PARTIALLY_FULFILLED);
    private static final int MAX_PENDING_PER_USER = 5;

    private final BloodRequestRepository requests;
    private final DonorResponseRepository responses;
    private final DonorProfileRepository donors;
    private final UserLookup lookup;
    private final NotificationService notifications;

    public RequestService(BloodRequestRepository requests, DonorResponseRepository responses,
                          DonorProfileRepository donors, UserLookup lookup, NotificationService notifications) {
        this.requests = requests; this.responses = responses; this.donors = donors;
        this.lookup = lookup; this.notifications = notifications;
    }

    @Transactional
    public RequestRes create(String email, RequestReq r) {
        User u = lookup.byEmail(email);
        long pending = requests.findByRequesterIdOrderByCreatedAtDesc(u.getId()).stream()
                .filter(x -> x.getStatus() == RequestStatus.PENDING).count();
        if (pending >= MAX_PENDING_PER_USER) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "You already have " + MAX_PENDING_PER_USER + " requests waiting for review");
        }
        BloodRequest b = new BloodRequest();
        b.setRequester(u);
        b.setPatientName(r.patientName().trim());
        b.setBloodGroup(r.bloodGroup());
        b.setUnits(r.units());
        b.setHospitalName(r.hospitalName().trim());
        b.setHospitalAddress(r.hospitalAddress().trim());
        b.setDivision(r.division());
        b.setDistrict(r.district());
        b.setUpazila(r.upazila());
        b.setRequiredAt(r.requiredAt());
        b.setUrgency(r.urgency());
        b.setContactPhone(r.contactPhone());
        b.setNotes(r.notes());
        b.setStatus(RequestStatus.PENDING); // always starts unverified; an admin must approve
        return toRes(requests.save(b), u, false);
    }

    /** Public list: only live (approved) requests. Patient name and contact number are hidden. */
    @Transactional(readOnly = true)
    public PageRes<RequestRes> publicList(BloodGroup bg, String district, Urgency urgency, int page, int size) {
        Specification<BloodRequest> spec = (root, q, cb) -> {
            List<Predicate> p = new ArrayList<>();
            p.add(root.get("status").in(LIVE));
            if (bg != null) p.add(cb.equal(root.get("bloodGroup"), bg));
            if (district != null && !district.isBlank()) p.add(cb.equal(root.get("district"), district));
            if (urgency != null) p.add(cb.equal(root.get("urgency"), urgency));
            return cb.and(p.toArray(new Predicate[0]));
        };
        Page<BloodRequest> res = requests.findAll(spec, PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50),
                Sort.by("requiredAt").ascending()));
        return new PageRes<>(res.getContent().stream().map(r -> toRes(r, null, false)).toList(),
                res.getNumber(), res.getTotalPages(), res.getTotalElements());
    }

    @Transactional(readOnly = true)
    public List<RequestRes> mine(String email) {
        User u = lookup.byEmail(email);
        return requests.findByRequesterIdOrderByCreatedAtDesc(u.getId()).stream().map(r -> toRes(r, u, false)).toList();
    }

    @Transactional
    public RequestRes cancel(String email, Long id) {
        User u = lookup.byEmail(email);
        BloodRequest r = owned(id, u);
        if (r.getStatus() == RequestStatus.FULFILLED || r.getStatus() == RequestStatus.CANCELLED
                || r.getStatus() == RequestStatus.REJECTED || r.getStatus() == RequestStatus.EXPIRED) {
            throw new ApiException(HttpStatus.CONFLICT, "This request can no longer be cancelled");
        }
        r.setStatus(RequestStatus.CANCELLED);
        return toRes(r, u, false);
    }

    @Transactional
    public RequestRes fulfill(String email, Long id) {
        User u = lookup.byEmail(email);
        BloodRequest r = owned(id, u);
        if (!LIVE.contains(r.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "Only an active request can be marked fulfilled");
        }
        r.setStatus(RequestStatus.FULFILLED);
        return toRes(r, u, false);
    }

    @Transactional
    public ResponseStatus respond(String email, Long id, boolean accept) {
        User donor = lookup.byEmail(email);
        BloodRequest r = requests.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Request not found"));
        if (!LIVE.contains(r.getStatus())) throw new ApiException(HttpStatus.CONFLICT, "This request is no longer active");
        if (r.getRequester().getId().equals(donor.getId())) throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot respond to your own request");
        DonorResponse resp = responses.findByRequestIdAndDonorId(id, donor.getId()).orElseGet(() -> {
            DonorResponse n = new DonorResponse(); n.setRequest(r); n.setDonor(donor); return n; });
        resp.setStatus(accept ? ResponseStatus.ACCEPTED : ResponseStatus.DECLINED);
        responses.save(resp);
        if (accept) {
            notifications.notify(r.getRequester(), r, "RESPONSE:" + donor.getId(),
                    "A donor has agreed to help with your " + label(r.getBloodGroup()) + " request at "
                            + r.getHospitalName() + ". Open your dashboard to see their contact details. "
                            + "The hospital must still verify blood type and compatibility.");
        }
        return resp.getStatus();
    }

    @Transactional(readOnly = true)
    public List<ResponseRes> responsesFor(String email, Long id) {
        User u = lookup.byEmail(email);
        owned(id, u);
        return responses.findByRequestIdOrderByCreatedAtAsc(id).stream().map(x -> {
            BloodGroup bg = donors.findByUserId(x.getDonor().getId()).map(DonorProfile::getBloodGroup).orElse(null);
            // A donor's phone is shared with the requester only after the donor agreed.
            String phone = x.getStatus() == ResponseStatus.ACCEPTED ? x.getDonor().getPhone() : null;
            return new ResponseRes(x.getId(), x.getDonor().getFullName(), bg, x.getStatus(), phone, x.getCreatedAt());
        }).toList();
    }

    // ---- admin moderation (called by AdminService, which records the audit log) ----

    @Transactional
    public BloodRequest approve(Long id) {
        BloodRequest r = pending(id);
        r.setStatus(RequestStatus.ACTIVE);
        notifications.notify(r.getRequester(), r, "STATUS", "Your request was approved and is now visible to donors.");
        String msg = "Someone near you needs " + label(r.getBloodGroup()) + " blood at " + r.getHospitalName() + ", "
                + r.getDistrict() + ". Respond only if you are willing and have checked that you are fit to donate. "
                + "The hospital will verify blood type and compatibility.";
        donors.findByBloodGroupAndDistrictAndAvailableTrueAndConsentSearchTrue(r.getBloodGroup(), r.getDistrict()).stream()
                .filter(d -> d.getUser().isActive() && !d.getUser().getId().equals(r.getRequester().getId()))
                .forEach(d -> notifications.notify(d.getUser(), r, "MATCH", msg));
        return r;
    }

    @Transactional
    public BloodRequest reject(Long id) {
        BloodRequest r = pending(id);
        r.setStatus(RequestStatus.REJECTED);
        notifications.notify(r.getRequester(), r, "STATUS", "Your request was not approved. Please check the details and submit again.");
        return r;
    }

    @Transactional(readOnly = true)
    public List<RequestRes> adminList(RequestStatus status) {
        return requests.findAll(Sort.by("createdAt").descending()).stream()
                .filter(r -> status == null || r.getStatus() == status)
                .map(r -> toRes(r, null, true)).toList();
    }

    @Scheduled(fixedRate = 3_600_000)
    @Transactional
    public void expireOverdue() {
        requests.expireOverdue(RequestStatus.EXPIRED, LIVE, LocalDateTime.now());
    }

    // ---- helpers ----

    private BloodRequest pending(Long id) {
        BloodRequest r = requests.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Request not found"));
        if (r.getStatus() != RequestStatus.PENDING) throw new ApiException(HttpStatus.CONFLICT, "Only pending requests can be reviewed");
        return r;
    }

    private BloodRequest owned(Long id, User u) {
        BloodRequest r = requests.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Request not found"));
        if (!r.getRequester().getId().equals(u.getId())) throw new ApiException(HttpStatus.FORBIDDEN, "This is not your request");
        return r;
    }

    /** viewer == null means the public. Owner and admin see everything; an accepting donor also sees the contact number. */
    RequestRes toRes(BloodRequest r, User viewer, boolean admin) {
        boolean owner = viewer != null && r.getRequester().getId().equals(viewer.getId());
        ResponseStatus mine = viewer == null ? null
                : responses.findByRequestIdAndDonorId(r.getId(), viewer.getId()).map(DonorResponse::getStatus).orElse(null);
        boolean full = owner || admin;
        boolean contact = full || mine == ResponseStatus.ACCEPTED;
        return new RequestRes(r.getId(), r.getBloodGroup(), r.getUnits(), r.getHospitalName(), r.getHospitalAddress(),
                r.getDivision(), r.getDistrict(), r.getUpazila(), r.getRequiredAt(), r.getUrgency(), r.getStatus(),
                full ? r.getPatientName() : null, contact ? r.getContactPhone() : null, r.getNotes(), r.getCreatedAt(), mine);
    }

    static String label(BloodGroup bg) { return bg.name().replace("_POS", "+").replace("_NEG", "-"); }
}
