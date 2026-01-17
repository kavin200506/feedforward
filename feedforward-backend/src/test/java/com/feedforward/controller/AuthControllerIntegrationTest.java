package com.feedforward.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.feedforward.dto.request.LoginRequest;
import com.feedforward.dto.request.RegisterRequest;
import com.feedforward.enums.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRegister_Success() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test Restaurant");
        request.setEmail("integration@test.com");
        request.setPhone("9876543210");
        request.setPassword("password123");
        request.setRole(Role.RESTAURANT);
        request.setOrganizationName("Test Restaurant Org");
        request.setAddress("123 Test Street");
        request.setLatitude(new BigDecimal("13.0827"));
        request.setLongitude(new BigDecimal("80.2707"));
        request.setCuisineType("Indian");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.email").value("integration@test.com"));
    }

    @Test
    void testLogin_Success() throws Exception {
        // First register
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setName("Test Restaurant");
        registerRequest.setEmail("login@test.com");
        registerRequest.setPhone("9876543211");
        registerRequest.setPassword("password123");
        registerRequest.setRole(Role.RESTAURANT);
        registerRequest.setOrganizationName("Test Restaurant Org");
        registerRequest.setAddress("123 Test Street");
        registerRequest.setLatitude(new BigDecimal("13.0827"));
        registerRequest.setLongitude(new BigDecimal("80.2707"));
        registerRequest.setCuisineType("Indian");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));

        // Then login
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("login@test.com");
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists());
    }
}


