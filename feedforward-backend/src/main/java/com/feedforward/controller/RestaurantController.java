package com.feedforward.controller;

import com.feedforward.dto.request.FoodListingRequest;
import com.feedforward.dto.response.ApiResponse;
import com.feedforward.dto.response.FoodListingResponse;
import com.feedforward.dto.response.RestaurantDashboardResponse;
import com.feedforward.enums.ListingStatus;
import com.feedforward.service.DashboardService;
import com.feedforward.service.FoodListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/restaurant")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RESTAURANT')")
public class RestaurantController {

    private static final Logger logger = LoggerFactory.getLogger(RestaurantController.class);

    private final FoodListingService foodListingService;
    private final DashboardService dashboardService;

    /**
     * Get restaurant dashboard
     * GET /api/restaurant/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<RestaurantDashboardResponse>> getDashboard() {
        logger.info("Restaurant dashboard request");

        RestaurantDashboardResponse dashboard = dashboardService.getRestaurantDashboard();

        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    /**
     * Add new food listing
     * POST /api/restaurant/listings
     */
    @PostMapping("/listings")
    public ResponseEntity<ApiResponse<FoodListingResponse>> addFoodListing(
            @Valid @RequestBody FoodListingRequest request
    ) {
        logger.info("Add food listing request: {}", request.getFoodName());

        FoodListingResponse response = foodListingService.addFoodListing(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Food listing added successfully", response));
    }

    /**
     * Get all my listings
     * GET /api/restaurant/listings
     */
    @GetMapping("/listings")
    public ResponseEntity<ApiResponse<List<FoodListingResponse>>> getMyListings() {
        logger.info("Get all listings request");

        List<FoodListingResponse> listings = foodListingService.getMyListings();

        return ResponseEntity.ok(ApiResponse.success(listings));
    }

    /**
     * Get active listings only
     * GET /api/restaurant/listings/active
     */
    @GetMapping("/listings/active")
    public ResponseEntity<ApiResponse<List<FoodListingResponse>>> getActiveListings() {
        logger.info("Get active listings request");

        List<FoodListingResponse> listings = foodListingService.getActiveListings();

        return ResponseEntity.ok(ApiResponse.success(listings));
    }

    /**
     * Get listing by ID
     * GET /api/restaurant/listings/{id}
     */
    @GetMapping("/listings/{id}")
    public ResponseEntity<ApiResponse<FoodListingResponse>> getListingById(
            @PathVariable Long id
    ) {
        logger.info("Get listing by ID: {}", id);

        FoodListingResponse listing = foodListingService.getListingById(id);

        return ResponseEntity.ok(ApiResponse.success(listing));
    }

    /**
     * Update listing status
     * PATCH /api/restaurant/listings/{id}/status
     */
    @PatchMapping("/listings/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateListingStatus(
            @PathVariable Long id,
            @RequestParam ListingStatus status
    ) {
        logger.info("Update listing {} status to {}", id, status);

        foodListingService.updateListingStatus(id, status);

        return ResponseEntity.ok(ApiResponse.success("Listing status updated successfully", null));
    }

    /**
     * Delete listing (soft delete)
     * DELETE /api/restaurant/listings/{id}
     */
    @DeleteMapping("/listings/{id}")
    public ResponseEntity<ApiResponse<String>> deleteListing(@PathVariable Long id) {
        logger.info("Delete listing: {}", id);

        foodListingService.deleteListing(id);

        return ResponseEntity.ok(ApiResponse.success("Listing deleted successfully", null));
    }

    /**
     * Delete ALL active listings (soft delete) for current restaurant
     * DELETE /api/restaurant/listings/active
     */
    @DeleteMapping("/listings/active")
    public ResponseEntity<ApiResponse<String>> deleteAllActiveListings() {
        logger.info("Delete ALL active listings");

        int deletedCount = foodListingService.deleteAllActiveListings();
        return ResponseEntity.ok(ApiResponse.success("Deleted " + deletedCount + " active listings", null));
    }
}


