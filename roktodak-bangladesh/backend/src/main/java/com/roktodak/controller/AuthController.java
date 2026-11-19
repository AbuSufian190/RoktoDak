package com.roktodak.controller;

import com.roktodak.dto.Dtos.*;
import com.roktodak.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {
    private final AuthService auth;
    public AuthController(AuthService auth) { this.auth = auth; }

    @PostMapping("/auth/register")
    public ResponseEntity<AuthRes> register(@Valid @RequestBody RegisterReq r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auth.register(r));
    }

    @PostMapping("/auth/login")
    public AuthRes login(@Valid @RequestBody LoginReq r) { return auth.login(r); }

    @GetMapping("/me")
    public UserRes me(Authentication a) { return auth.me(a.getName()); }

    @PutMapping("/me/language")
    public UserRes language(Authentication a, @Valid @RequestBody LanguageReq r) { return auth.setLanguage(a.getName(), r.language()); }
}
