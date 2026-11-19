package com.roktodak.controller;

import com.roktodak.dto.Dtos.*;
import com.roktodak.entity.BloodGroup;
import com.roktodak.entity.ResponseStatus;
import com.roktodak.entity.Urgency;
import com.roktodak.service.RequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
public class RequestController {
    private final RequestService service;
    public RequestController(RequestService service) { this.service = service; }

    @GetMapping
    public PageRes<RequestRes> list(@RequestParam(required = false) BloodGroup bloodGroup,
                                    @RequestParam(required = false) String district,
                                    @RequestParam(required = false) Urgency urgency,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "12") int size) {
        return service.publicList(bloodGroup, district, urgency, page, size);
    }

    @PostMapping @PreAuthorize("hasAnyRole('DONOR','SEEKER','ORGANIZATION')")
    public ResponseEntity<RequestRes> create(Authentication a, @Valid @RequestBody RequestReq r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(a.getName(), r));
    }

    @GetMapping("/mine") @PreAuthorize("hasAnyRole('DONOR','SEEKER','ORGANIZATION')")
    public List<RequestRes> mine(Authentication a) { return service.mine(a.getName()); }

    @PutMapping("/{id}/cancel")
    public RequestRes cancel(Authentication a, @PathVariable Long id) { return service.cancel(a.getName(), id); }

    @PutMapping("/{id}/fulfill")
    public RequestRes fulfill(Authentication a, @PathVariable Long id) { return service.fulfill(a.getName(), id); }

    @PostMapping("/{id}/respond") @PreAuthorize("hasRole('DONOR')")
    public Map<String, ResponseStatus> respond(Authentication a, @PathVariable Long id, @RequestBody RespondReq r) {
        return Map.of("status", service.respond(a.getName(), id, r.accept()));
    }

    @GetMapping("/{id}/responses")
    public List<ResponseRes> responses(Authentication a, @PathVariable Long id) { return service.responsesFor(a.getName(), id); }
}
