package com.feedforward.controller;

import com.feedforward.dto.response.ApiResponse;
import com.feedforward.dto.response.ImpactStatsResponse;
import com.feedforward.dto.response.NgoLeaderboardResponse;
import com.feedforward.dto.response.RestaurantLeaderboardResponse;
import com.feedforward.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/impact")
@RequiredArgsConstructor
public class ImpactController {

    private static final Logger logger = LoggerFactory.getLogger(ImpactController.class);

    private final DashboardService dashboardService;

    /**
     * Get global impact statistics (Public)
     * GET /api/impact/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<ImpactStatsResponse>> getImpactStatistics() {
        logger.info("Get global impact statistics");

        ImpactStatsResponse stats = dashboardService.getImpactStatistics();

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /**
     * Get top restaurants (Public)
     * GET /api/impact/top-restaurants
     */
    @GetMapping("/top-restaurants")
    public ResponseEntity<ApiResponse<List<RestaurantLeaderboardResponse>>> getTopRestaurants() {
        logger.info("Get top restaurants");

        List<RestaurantLeaderboardResponse> restaurants = dashboardService.getTopRestaurants();

        return ResponseEntity.ok(ApiResponse.success(restaurants));
    }

    /**
     * Get top NGOs (Public)
     * GET /api/impact/top-ngos
     */
    @GetMapping("/top-ngos")
    public ResponseEntity<ApiResponse<List<NgoLeaderboardResponse>>> getTopNgos() {
        logger.info("Get top NGOs");

        List<NgoLeaderboardResponse> ngos = dashboardService.getTopNgos();

        return ResponseEntity.ok(ApiResponse.success(ngos));
    }
}


