package com.roktodak.dto;

import com.roktodak.entity.*;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** All request/response shapes. JPA entities are never returned from controllers. */
public final class Dtos {
    private Dtos() {}

    public static final String BD_PHONE = "^(\\+8801|01)[3-9]\\d{8}$";
    public static final String PHONE_MSG = "Enter a valid Bangladesh mobile number";

    public record RegisterReq(
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotBlank @Pattern(regexp = BD_PHONE, message = PHONE_MSG) String phone,
            @NotNull Role role,
            BloodGroup bloodGroup, String division, String district, String upazila,
            LocalDate dateOfBirth, LocalDate lastDonationDate, Boolean consentSearch) {}

    public record LoginReq(@NotBlank String email, @NotBlank String password) {}
    public record UserRes(Long id, String fullName, String email, Role role, String language, boolean hasDonorProfile) {}
    public record AuthRes(String token, UserRes user) {}
    public record LanguageReq(@NotBlank @Pattern(regexp = "bn|en") String language) {}

    public record DonorProfileReq(
            @NotNull BloodGroup bloodGroup, @NotBlank String division, @NotBlank String district, String upazila,
            @Past LocalDate dateOfBirth, @PastOrPresent LocalDate lastDonationDate,
            boolean available, boolean consentSearch, boolean shareLastDonation) {}

    public record DonorProfileRes(Long id, BloodGroup bloodGroup, String division, String district, String upazila,
            LocalDate dateOfBirth, LocalDate lastDonationDate, boolean available, boolean consentSearch,
            boolean shareLastDonation, boolean verified) {}

    /** Public donor card: no phone, no email, no exact address, privacy-safe display name. */
    public record DonorCard(Long id, String displayName, BloodGroup bloodGroup, String division, String district,
            String upazila, boolean available, boolean verified, LocalDate lastDonationDate, List<String> reasons) {}

    public record RequestReq(
            @NotBlank @Size(max = 100) String patientName,
            @NotNull BloodGroup bloodGroup,
            @Min(1) @Max(20) int units,
            @NotBlank String hospitalName, @NotBlank String hospitalAddress,
            @NotBlank String division, @NotBlank String district, String upazila,
            @NotNull @Future LocalDateTime requiredAt,
            @NotNull Urgency urgency,
            @NotBlank @Pattern(regexp = BD_PHONE, message = PHONE_MSG) String contactPhone,
            @Size(max = 1000) String notes) {}

    public record RequestRes(Long id, BloodGroup bloodGroup, int units, String hospitalName, String hospitalAddress,
            String division, String district, String upazila, LocalDateTime requiredAt, Urgency urgency,
            RequestStatus status, String patientName, String contactPhone, String notes, Instant createdAt,
            ResponseStatus myResponse) {}

    public record RespondReq(boolean accept) {}
    public record ResponseRes(Long id, String donorName, BloodGroup bloodGroup, ResponseStatus status,
            String donorPhone, Instant createdAt) {}
    public record NotificationRes(Long id, String message, Long requestId, boolean seen, Instant createdAt) {}

    public record Stats(long users, long donors, long activeDonors, long requests, long activeRequests,
            long fulfilledRequests, long pendingRequests) {}
    public record AdminUserRes(Long id, String fullName, String email, Role role, boolean active,
            Long donorProfileId, boolean verified) {}
    public record ActiveReq(boolean active) {}
    public record LogRes(Long id, String adminEmail, String action, String targetType, Long targetId, Instant createdAt) {}
    public record PageRes<T>(List<T> items, int page, int totalPages, long total) {}
}
