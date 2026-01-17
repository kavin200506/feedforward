package com.feedforward.controller;

import com.feedforward.dto.request.ApproveRequestDto;
import com.feedforward.dto.request.CompleteDonationRequest;
import com.feedforward.dto.request.CreateFoodRequestDto;
import com.feedforward.dto.request.RejectRequestDto;
import com.feedforward.dto.response.ApiResponse;
import com.feedforward.dto.response.FoodRequestResponse;
import com.feedforward.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/requests")
@RequiredArgsConstructor
public class RequestController {

    private static final Logger logger = LoggerFactory.getLogger(RequestController.class);

    private final RequestService requestService;

    // ==================== NGO Endpoints ====================

    /**
     * Create food request (NGO only)
     * POST /api/requests
     */
    @PostMapping
    public ResponseEntity<ApiResponse<FoodRequestResponse>> createRequest(
            @Valid @RequestBody CreateFoodRequestDto request
    ) {
        logger.info("Create food request for listing: {}", request.getListingId());

        FoodRequestResponse response = requestService.createRequest(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Request created successfully", response));
    }

    /**
     * Get all my requests (NGO)
     * GET /api/requests/ngo/my-requests
     */
    @GetMapping("/ngo/my-requests")
    public ResponseEntity<ApiResponse<List<FoodRequestResponse>>> getMyRequests() {
        logger.info("Get all NGO requests");

        List<FoodRequestResponse> requests = requestService.getMyRequests();

        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    /**
     * Get active requests (NGO)
     * GET /api/requests/ngo/active
     */
    @GetMapping("/ngo/active")
    public ResponseEntity<ApiResponse<List<FoodRequestResponse>>> getActiveRequests() {
        logger.info("Get active NGO requests");

        List<FoodRequestResponse> requests = requestService.getActiveRequests();

        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    /**
     * Get completed requests (NGO)
     * GET /api/requests/ngo/completed
     */
    @GetMapping("/ngo/completed")
    public ResponseEntity<ApiResponse<List<FoodRequestResponse>>> getCompletedRequests() {
        logger.info("Get completed NGO requests");

        List<FoodRequestResponse> requests = requestService.getCompletedRequests();

        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    /**
     * Mark request as picked up (NGO)
     * PATCH /api/requests/{id}/pickup
     */
    @PatchMapping("/{id}/pickup")
    public ResponseEntity<ApiResponse<FoodRequestResponse>> markAsPickedUp(
            @PathVariable Long id
    ) {
        logger.info("Mark request {} as picked up", id);

        FoodRequestResponse response = requestService.markAsPickedUp(id);

        return ResponseEntity.ok(ApiResponse.success("Marked as picked up", response));
    }

    /**
     * Complete donation (NGO)
     * POST /api/requests/{id}/complete
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<FoodRequestResponse>> completeDonation(
            @PathVariable Long id,
            @Valid @RequestBody CompleteDonationRequest request
    ) {
        logger.info("Complete donation for request: {}", id);

        FoodRequestResponse response = requestService.completeDonation(id, request);

        return ResponseEntity.ok(ApiResponse.success("Donation completed successfully", response));
    }

    /**
     * Cancel request (NGO)
     * DELETE /api/requests/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> cancelRequest(@PathVariable Long id) {
        logger.info("Cancel request: {}", id);

        requestService.cancelRequest(id);

        return ResponseEntity.ok(ApiResponse.success("Request cancelled successfully", null));
    }

    // ==================== Restaurant Endpoints ====================

    /**
     * Get pending requests for restaurant
     * GET /api/requests/restaurant/pending
     */
    @GetMapping("/restaurant/pending")
    public ResponseEntity<ApiResponse<List<FoodRequestResponse>>> getPendingRequests() {
        logger.info("Get pending restaurant requests");

        List<FoodRequestResponse> requests = requestService.getPendingRequestsForRestaurant();

        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    /**
     * Get all requests for restaurant
     * GET /api/requests/restaurant/all
     */
    @GetMapping("/restaurant/all")
    public ResponseEntity<ApiResponse<List<FoodRequestResponse>>> getAllRestaurantRequests() {
        logger.info("Get all restaurant requests");

        List<FoodRequestResponse> requests = requestService.getAllRequestsForRestaurant();

        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    /**
     * Approve request (Restaurant)
     * POST /api/requests/{id}/approve
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<FoodRequestResponse>> approveRequest(
            @PathVariable Long id,
            @Valid @RequestBody ApproveRequestDto request
    ) {
        logger.info("Approve request: {}", id);

        FoodRequestResponse response = requestService.approveRequest(id, request);

        return ResponseEntity.ok(ApiResponse.success("Request approved successfully", response));
    }

    /**
     * Reject request (Restaurant)
     * POST /api/requests/{id}/reject
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<FoodRequestResponse>> rejectRequest(
            @PathVariable Long id,
            @Valid @RequestBody RejectRequestDto request
    ) {
        logger.info("Reject request: {}", id);

        FoodRequestResponse response = requestService.rejectRequest(id, request);

        return ResponseEntity.ok(ApiResponse.success("Request rejected", response));
    }

    // ==================== Common Endpoints ====================

    /**
     * Get request details by ID
     * GET /api/requests/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FoodRequestResponse>> getRequestById(
            @PathVariable Long id
    ) {
        logger.info("Get request by ID: {}", id);

        FoodRequestResponse response = requestService.getRequestById(id);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}


