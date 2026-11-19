package com.roktodak.controller;

import com.roktodak.dto.Dtos.*;
import com.roktodak.entity.BloodGroup;
import com.roktodak.service.DonorService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/donors")
public class DonorController {
    private final DonorService donors;
    public DonorController(DonorService donors) { this.donors = donors; }

    @GetMapping("/search")
    public PageRes<DonorCard> search(@RequestParam(required = false) BloodGroup bloodGroup,
                                     @RequestParam(required = false) String division,
                                     @RequestParam(required = false) String district,
                                     @RequestParam(required = false) String upazila,
                                     @RequestParam(defaultValue = "false") boolean availableOnly,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "12") int size) {
        return donors.search(bloodGroup, division, district, upazila, availableOnly, page, size);
    }

    @GetMapping("/me") @PreAuthorize("hasRole('DONOR')")
    public DonorProfileRes me(Authentication a) { return donors.myProfile(a.getName()); }

    @PutMapping("/me") @PreAuthorize("hasRole('DONOR')")
    public DonorProfileRes save(Authentication a, @Valid @RequestBody DonorProfileReq r) { return donors.saveProfile(a.getName(), r); }

    @GetMapping("/me/matching-requests") @PreAuthorize("hasRole('DONOR')")
    public List<RequestRes> matching(Authentication a) { return donors.matchingRequests(a.getName()); }
}
