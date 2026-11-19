package com.roktodak;

import com.roktodak.entity.Role;
import com.roktodak.entity.User;
import com.roktodak.security.JwtService;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {
    private static final String SECRET = "unit-test-secret-unit-test-secret-1234";

    @Test
    void validTokenReturnsSubject() {
        JwtService jwt = new JwtService(SECRET, 5);
        User u = new User(); u.setEmail("a@b.com"); u.setRole(Role.DONOR);
        assertEquals("a@b.com", jwt.validate(jwt.create(u)).orElseThrow());
    }

    @Test
    void tamperedTokenIsRejected() {
        JwtService jwt = new JwtService(SECRET, 5);
        User u = new User(); u.setEmail("a@b.com"); u.setRole(Role.DONOR);
        assertTrue(jwt.validate(jwt.create(u) + "x").isEmpty());
    }

    @Test
    void shortSecretFailsFast() {
        assertThrows(IllegalStateException.class, () -> new JwtService("short", 5));
    }
}
