package com.roktodak;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RoktodakApplication {
    public static void main(String[] args) {
        SpringApplication.run(RoktodakApplication.class, args);
    }
}
