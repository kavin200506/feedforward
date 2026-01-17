package com.feedforward.controller;

import com.feedforward.dto.request.LoginRequest;
import com.feedforward.dto.request.RegisterRequest;
import com.feedforward.dto.response.ApiResponse;
import com.feedforward.dto.response.AuthResponse;
import com.feedforward.dto.response.UserProfileResponse;
import com.feedforward.service.AuthService;
import com.feedforward.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    /**
     * Register new user (Restaurant or NGO)
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        logger.info("Registration request received for email: {}", request.getEmail());

        AuthResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        logger.info("Login request received for email: {}", request.getEmail());

        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    /**
     * Get current user profile
     * GET /api/auth/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUserProfile() {
        Long userId = SecurityUtil.getCurrentUserId();
        logger.info("Profile request for user: {}", userId);

        UserProfileResponse profile = authService.getCurrentUserProfile(userId);

        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * Health check endpoint
     * GET /api/auth/health
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Server is running"));
    }
}


