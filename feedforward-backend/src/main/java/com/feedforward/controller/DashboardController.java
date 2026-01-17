package com.feedforward.controller;

import com.feedforward.dto.response.*;
import com.feedforward.service.DashboardService;
import com.feedforward.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    private final DashboardService dashboardService;

    /**
     * Get dashboard based on user role
     * GET /api/dashboard
     */
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getDashboard() {
        logger.info("Dashboard request for user: {}", SecurityUtil.getCurrentUserId());

        if (SecurityUtil.isRestaurant()) {
            RestaurantDashboardResponse dashboard = dashboardService.getRestaurantDashboard();
            return ResponseEntity.ok(ApiResponse.success(dashboard));
        } else if (SecurityUtil.isNgo()) {
            NgoDashboardResponse dashboard = dashboardService.getNgoDashboard();
            return ResponseEntity.ok(ApiResponse.success(dashboard));
        }

        return ResponseEntity.badRequest()
                .body(ApiResponse.error("Invalid user role"));
    }

    /**
     * Get restaurant leaderboard
     * GET /api/dashboard/leaderboard/restaurants
     */
    @GetMapping("/leaderboard/restaurants")
    public ResponseEntity<ApiResponse<List<RestaurantLeaderboardResponse>>> getRestaurantLeaderboard() {
        logger.info("Get restaurant leaderboard");

        List<RestaurantLeaderboardResponse> leaderboard = dashboardService.getTopRestaurants();

        return ResponseEntity.ok(ApiResponse.success(leaderboard));
    }

    /**
     * Get NGO leaderboard
     * GET /api/dashboard/leaderboard/ngos
     */
    @GetMapping("/leaderboard/ngos")
    public ResponseEntity<ApiResponse<List<NgoLeaderboardResponse>>> getNgoLeaderboard() {
        logger.info("Get NGO leaderboard");

        List<NgoLeaderboardResponse> leaderboard = dashboardService.getTopNgos();

        return ResponseEntity.ok(ApiResponse.success(leaderboard));
    }
}


