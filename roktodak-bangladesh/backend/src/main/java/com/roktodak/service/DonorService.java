package com.roktodak.service;

import com.roktodak.dto.Dtos.*;
import com.roktodak.entity.*;
import com.roktodak.exception.ApiException;
import com.roktodak.repository.BloodRequestRepository;
import com.roktodak.repository.DonorProfileRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class DonorService {
    private final DonorProfileRepository donors;
    private final BloodRequestRepository requests;
    private final UserLookup lookup;
    private final RequestService requestService;

    public DonorService(DonorProfileRepository donors, BloodRequestRepository requests, UserLookup lookup,
                        RequestService requestService) {
        this.donors = donors; this.requests = requests; this.lookup = lookup; this.requestService = requestService;
    }

    @Transactional(readOnly = true)
    public DonorProfileRes myProfile(String email) {
        User u = lookup.byEmail(email);
        return donors.findByUserId(u.getId()).map(DonorService::toRes)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No donor profile yet"));
    }

    @Transactional
    public DonorProfileRes saveProfile(String email, DonorProfileReq r) {
        User u = lookup.byEmail(email);
        if (u.getRole() != Role.DONOR) throw new ApiException(HttpStatus.FORBIDDEN, "Only donor accounts have a donor profile");
        DonorProfile p = donors.findByUserId(u.getId()).orElseGet(() -> { DonorProfile n = new DonorProfile(); n.setUser(u); return n; });
        boolean blockChanged = p.getBloodGroup() != null && p.getBloodGroup() != r.bloodGroup();
        p.setBloodGroup(r.bloodGroup());
        p.setDivision(r.division());
        p.setDistrict(r.district());
        p.setUpazila(r.upazila());
        p.setDateOfBirth(r.dateOfBirth());
        p.setLastDonationDate(r.lastDonationDate());
        p.setAvailable(r.available());
        p.setConsentSearch(r.consentSearch());
        p.setShareLastDonation(r.shareLastDonation());
        if (blockChanged) p.setVerified(false); // a changed blood group must be re-verified by an admin
        p.setUpdatedAt(Instant.now());
        return toRes(donors.save(p));
    }

    /** Public, privacy-safe search: only consenting donors of active accounts, never phone/email. */
    @Transactional(readOnly = true)
    public PageRes<DonorCard> search(BloodGroup bg, String division, String district, String upazila,
                                     boolean availableOnly, int page, int size) {
        Specification<DonorProfile> spec = (root, q, cb) -> {
            List<Predicate> p = new ArrayList<>();
            p.add(cb.isTrue(root.get("consentSearch")));
            p.add(cb.isTrue(root.join("user").get("active")));
            if (bg != null) p.add(cb.equal(root.get("bloodGroup"), bg));
            if (notBlank(division)) p.add(cb.equal(root.get("division"), division));
            if (notBlank(district)) p.add(cb.equal(root.get("district"), district));
            if (notBlank(upazila)) p.add(cb.equal(root.get("upazila"), upazila));
            if (availableOnly) p.add(cb.isTrue(root.get("available")));
            return cb.and(p.toArray(new Predicate[0]));
        };
        PageRequest pr = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50),
                Sort.by(Sort.Order.desc("verified"), Sort.Order.desc("available"), Sort.Order.asc("id")));
        Page<DonorProfile> result = donors.findAll(spec, pr);
        List<DonorCard> cards = result.getContent().stream().map(d -> toCard(d, bg, district)).toList();
        return new PageRes<>(cards, result.getNumber(), result.getTotalPages(), result.getTotalElements());
    }

    /** Active requests in the donor's own district with the same blood group (a hint, not a medical match). */
    @Transactional(readOnly = true)
    public List<RequestRes> matchingRequests(String email) {
        User u = lookup.byEmail(email);
        DonorProfile p = donors.findByUserId(u.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No donor profile yet"));
        return requests.findByBloodGroupAndDistrictAndStatusInOrderByRequiredAtAsc(p.getBloodGroup(), p.getDistrict(),
                        List.of(RequestStatus.ACTIVE, RequestStatus.PARTIALLY_FULFILLED)).stream()
                .filter(r -> !r.getRequester().getId().equals(u.getId()))
                .map(r -> requestService.toRes(r, u, false)).toList();
    }

    private DonorCard toCard(DonorProfile d, BloodGroup bg, String district) {
        List<String> reasons = new ArrayList<>();
        if (bg != null) reasons.add("Blood group matches your search");
        if (notBlank(district)) reasons.add("Lives in " + district);
        if (d.isAvailable()) reasons.add("Marked available");
        if (d.isVerified()) reasons.add("Verified by an admin");
        String[] parts = d.getUser().getFullName().trim().split("\\s+");
        String display = parts.length > 1 ? parts[0] + " " + parts[parts.length - 1].charAt(0) + "." : parts[0];
        return new DonorCard(d.getId(), display, d.getBloodGroup(), d.getDivision(), d.getDistrict(), d.getUpazila(),
                d.isAvailable(), d.isVerified(), d.isShareLastDonation() ? d.getLastDonationDate() : null, reasons);
    }

    static DonorProfileRes toRes(DonorProfile p) {
        return new DonorProfileRes(p.getId(), p.getBloodGroup(), p.getDivision(), p.getDistrict(), p.getUpazila(),
                p.getDateOfBirth(), p.getLastDonationDate(), p.isAvailable(), p.isConsentSearch(),
                p.isShareLastDonation(), p.isVerified());
    }

    private static boolean notBlank(String s) { return s != null && !s.isBlank(); }
}
