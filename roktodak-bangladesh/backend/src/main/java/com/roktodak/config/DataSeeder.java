package com.roktodak.config;

import com.roktodak.entity.Role;
import com.roktodak.entity.User;
import com.roktodak.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Creates the first admin only when ADMIN_EMAIL and ADMIN_PASSWORD are provided via environment. */
@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final String email;
    private final String password;

    public DataSeeder(UserRepository users, PasswordEncoder encoder,
                      @Value("${app.admin.email}") String email, @Value("${app.admin.password}") String password) {
        this.users = users; this.encoder = encoder; this.email = email; this.password = password;
    }

    @Override
    public void run(String... args) {
        if (email.isBlank() || password.length() < 8 || users.existsByEmail(email.toLowerCase())) return;
        User u = new User();
        u.setFullName("Administrator");
        u.setEmail(email.toLowerCase());
        u.setPasswordHash(encoder.encode(password));
        u.setRole(Role.ADMIN);
        users.save(u);
    }
}
