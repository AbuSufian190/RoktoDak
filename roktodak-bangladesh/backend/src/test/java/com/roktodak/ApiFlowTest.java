package com.roktodak;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import java.util.UUID;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ApiFlowTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    private String donorJson(String email) {
        return """
            {"fullName":"Rahim Uddin Khan","email":"%s","password":"Passw0rd!x","phone":"01712345678",
             "role":"DONOR","bloodGroup":"O_POS","division":"Dhaka","district":"Dhaka","consentSearch":true}
            """.formatted(email);
    }

    private String register(String email) throws Exception {
        MvcResult r = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(donorJson(email)))
                .andExpect(status().isCreated()).andReturn();
        JsonNode n = om.readTree(r.getResponse().getContentAsString());
        return n.get("token").asText();
    }

    @Test
    void registrationSucceedsAndDuplicateEmailIsRejected() throws Exception {
        String email = UUID.randomUUID() + "@test.com";
        register(email);
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(donorJson(email)))
                .andExpect(status().isConflict());
    }

    @Test
    void invalidLoginIsUnauthorized() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"nobody@test.com\",\"password\":\"wrong-password\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void anonymousCannotReachDashboardOrAdmin() throws Exception {
        mvc.perform(get("/api/donors/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/stats")).andExpect(status().isUnauthorized());
    }

    @Test
    void donorCannotUseAdminEndpoints() throws Exception {
        String token = register(UUID.randomUUID() + "@test.com");
        mvc.perform(get("/api/admin/stats").header("Authorization", "Bearer " + token)).andExpect(status().isForbidden());
    }

    @Test
    void publicDonorSearchNeverExposesContactDetails() throws Exception {
        register(UUID.randomUUID() + "@test.com");
        MvcResult r = mvc.perform(get("/api/donors/search").param("bloodGroup", "O_POS")).andExpect(status().isOk()).andReturn();
        String body = r.getResponse().getContentAsString();
        org.junit.jupiter.api.Assertions.assertFalse(body.contains("01712345678"), "phone leaked");
        org.junit.jupiter.api.Assertions.assertFalse(body.contains("@test.com"), "email leaked");
        org.junit.jupiter.api.Assertions.assertTrue(body.contains("Rahim K."), "expected privacy-safe display name");
    }
}
