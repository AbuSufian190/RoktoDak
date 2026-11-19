package com.roktodak.service;

import com.roktodak.dto.Dtos.*;
import com.roktodak.entity.*;
import com.roktodak.exception.ApiException;
import com.roktodak.repository.DonorProfileRepository;
import com.roktodak.repository.UserRepository;
import com.roktodak.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final DonorProfileRepository donors;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final UserLookup lookup;

    public AuthService(UserRepository users, DonorProfileRepository donors, PasswordEncoder encoder,
                       JwtService jwt, UserLookup lookup) {
        this.users = users; this.donors = donors; this.encoder = encoder; this.jwt = jwt; this.lookup = lookup;
    }

    @Transactional
    public AuthRes register(RegisterReq r) {
        if (r.role() != Role.DONOR && r.role() != Role.SEEKER) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You can register as a donor or a blood seeker");
        }
        String email = r.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        if (r.role() == Role.DONOR && (r.bloodGroup() == null || blank(r.division()) || blank(r.district())
                || !Boolean.TRUE.equals(r.consentSearch()))) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Donors must choose a blood group, division, district and agree to appear in donor search");
        }
        User u = new User();
        u.setFullName(r.fullName().trim());
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(r.password()));
        u.setPhone(r.phone());
        u.setRole(r.role());
        users.save(u);

        if (r.role() == Role.DONOR) {
            DonorProfile p = new DonorProfile();
            p.setUser(u);
            p.setBloodGroup(r.bloodGroup());
            p.setDivision(r.division());
            p.setDistrict(r.district());
            p.setUpazila(r.upazila());
            p.setDateOfBirth(r.dateOfBirth());
            p.setLastDonationDate(r.lastDonationDate());
            p.setAvailable(true);
            p.setConsentSearch(true);
            donors.save(p);
        }
        return new AuthRes(jwt.create(u), toRes(u));
    }

    public AuthRes login(LoginReq r) {
        User u = users.findByEmail(r.email().trim().toLowerCase()).orElse(null);
        // Same message for unknown email and wrong password so accounts cannot be probed.
        if (u == null || !u.isActive() || !encoder.matches(r.password(), u.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return new AuthRes(jwt.create(u), toRes(u));
    }

    public UserRes me(String email) { return toRes(lookup.byEmail(email)); }

    @Transactional
    public UserRes setLanguage(String email, String language) {
        User u = lookup.byEmail(email);
        u.setLanguage(language);
        return toRes(users.save(u));
    }

    private UserRes toRes(User u) {
        return new UserRes(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.getLanguage(),
                donors.findByUserId(u.getId()).isPresent());
    }

    private static boolean blank(String s) { return s == null || s.isBlank(); }
}
