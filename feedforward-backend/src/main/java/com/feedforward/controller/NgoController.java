package com.feedforward.controller;

import com.feedforward.dto.request.SearchFoodRequest;
import com.feedforward.dto.response.ApiResponse;
import com.feedforward.dto.response.FoodListingResponse;
import com.feedforward.dto.response.NgoDashboardResponse;
import com.feedforward.dto.response.SearchFoodWithNearbyResponse;
import com.feedforward.service.DashboardService;
import com.feedforward.service.FoodListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ngo")
@RequiredArgsConstructor
@PreAuthorize("hasRole('NGO')")
public class NgoController {

    private static final Logger logger = LoggerFactory.getLogger(NgoController.class);

    private final FoodListingService foodListingService;
    private final DashboardService dashboardService;

    /**
     * Get NGO dashboard
     * GET /api/ngo/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<NgoDashboardResponse>> getDashboard() {
        logger.info("NGO dashboard request");

        NgoDashboardResponse dashboard = dashboardService.getNgoDashboard();

        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    /**
     * Search available food listings
     * POST /api/ngo/search
     */
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<FoodListingResponse>>> searchAvailableFood(
            @Valid @RequestBody SearchFoodRequest request
    ) {
        logger.info("Search food request with distance: {} km", request.getDistance());

        List<FoodListingResponse> listings = foodListingService.searchAvailableFood(request);

        return ResponseEntity.ok(ApiResponse.success(listings));
    }

    /**
     * Get all available food listings (default search)
     * GET /api/ngo/available
     */
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<FoodListingResponse>>> getAvailableFood() {
        logger.info("Get available food request");

        SearchFoodRequest defaultSearch = new SearchFoodRequest();
        defaultSearch.setDistance(10.0);
        defaultSearch.setSortBy("expiry");

        List<FoodListingResponse> listings = foodListingService.searchAvailableFood(defaultSearch);

        return ResponseEntity.ok(ApiResponse.success(listings));
    }

    /**
     * Search available food with nearby unregistered restaurants
     * POST /api/ngo/search-with-nearby
     */
    @PostMapping("/search-with-nearby")
    public ResponseEntity<ApiResponse<SearchFoodWithNearbyResponse>> searchFoodWithNearby(
            @Valid @RequestBody SearchFoodRequest request
    ) {
        logger.info("Search food with nearby restaurants request with distance: {} km", request.getDistance());

        SearchFoodWithNearbyResponse results = foodListingService.searchFoodWithNearby(request);

        return ResponseEntity.ok(ApiResponse.success(results));
    }

    /**
     * Get listing details by ID
     * GET /api/ngo/listings/{id}
     */
    @GetMapping("/listings/{id}")
    public ResponseEntity<ApiResponse<FoodListingResponse>> getListingById(
            @PathVariable Long id
    ) {
        logger.info("NGO get listing by ID: {}", id);

        FoodListingResponse listing = foodListingService.getListingById(id);

        return ResponseEntity.ok(ApiResponse.success(listing));
    }
}


