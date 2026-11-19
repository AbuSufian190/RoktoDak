package com.roktodak.service;

import com.roktodak.entity.User;
import com.roktodak.exception.ApiException;
import com.roktodak.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class UserLookup {
    private final UserRepository users;
    public UserLookup(UserRepository users) { this.users = users; }

    public User byEmail(String email) {
        return users.findByEmail(email).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Please log in again"));
    }
}
