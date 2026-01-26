package com.feedforward.service;

import com.feedforward.dto.request.ApproveRequestDto;
import com.feedforward.dto.request.CompleteDonationRequest;
import com.feedforward.dto.request.CreateFoodRequestDto;
import com.feedforward.dto.request.RejectRequestDto;
import com.feedforward.dto.response.FoodRequestResponse;
import com.feedforward.entity.*;
import com.feedforward.enums.ListingStatus;
import com.feedforward.enums.RequestStatus;
import com.feedforward.exception.BadRequestException;
import com.feedforward.exception.InvalidOperationException;
import com.feedforward.exception.ResourceNotFoundException;
import com.feedforward.exception.UnauthorizedException;
import com.feedforward.repository.*;
import com.feedforward.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RequestService {

    private static final Logger logger = LoggerFactory.getLogger(RequestService.class);

    private final FoodRequestRepository requestRepository;
    private final FoodListingRepository listingRepository;
    private final NgoRepository ngoRepository;
    private final RestaurantRepository restaurantRepository;
    private final DonationHistoryRepository donationHistoryRepository;
    private final MatchingAlgorithmService matchingAlgorithmService;

    /**
     * Create a food request (NGO only)
     */
    @Transactional
    public FoodRequestResponse createRequest(CreateFoodRequestDto request) {
        Long userId = SecurityUtil.getCurrentUserId();
        logger.info("Creating food request for user: {}", userId);

        // Get NGO
        Ngo ngo = ngoRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found"));

        // Get food listing
        FoodListing listing = listingRepository.findByIdWithRestaurant(request.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Food listing", "id", request.getListingId()));

        // Validate listing availability
        validateListingAvailability(listing);

        // Check if NGO has already requested this listing
        if (requestRepository.hasNgoRequestedListing(request.getListingId(), ngo.getNgoId())) {
            throw new BadRequestException("You have already requested this food listing");
        }

        // Validate quantity
        if (request.getQuantityRequested() > listing.getQuantity()) {
            throw new BadRequestException("Requested quantity exceeds available quantity");
        }

        // Validate pickup time
        if (request.getPickupTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Pickup time cannot be in the past");
        }
        if (request.getPickupTime().isAfter(listing.getExpiryTime())) {
            throw new BadRequestException("Pickup time cannot be after food expiry time");
        }

        // Create food request
        FoodRequest foodRequest = FoodRequest.builder()
                .foodListing(listing)
                .restaurant(listing.getRestaurant()) // Set restaurant from listing
                .ngo(ngo)
                .quantityRequested(request.getQuantityRequested())
                .urgencyLevel(request.getUrgencyLevel())
                .pickupTime(request.getPickupTime())
                .notes(request.getNotes())
                .status(RequestStatus.PENDING)
                .build();

        foodRequest = requestRepository.save(foodRequest);
        logger.info("Food request created with ID: {}", foodRequest.getRequestId());

        return buildRequestResponse(foodRequest);
    }

    /**
     * Get all requests for NGO
     */
    @Transactional(readOnly = true)
    public List<FoodRequestResponse> getMyRequests() {
        Long userId = SecurityUtil.getCurrentUserId();

        Ngo ngo = ngoRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found"));

        List<FoodRequest> requests = requestRepository.findByNgoId(ngo.getNgoId());

        return requests.stream()
                .map(this::buildRequestResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get active requests for NGO
     */
    @Transactional(readOnly = true)
    public List<FoodRequestResponse> getActiveRequests() {
        Long userId = SecurityUtil.getCurrentUserId();

        Ngo ngo = ngoRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found"));

        List<FoodRequest> requests = requestRepository.findActiveRequestsByNgoId(ngo.getNgoId());

        return requests.stream()
                .map(this::buildRequestResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get completed requests for NGO
     */
    @Transactional(readOnly = true)
    public List<FoodRequestResponse> getCompletedRequests() {
        Long userId = SecurityUtil.getCurrentUserId();

        Ngo ngo = ngoRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found"));

        List<FoodRequest> requests = requestRepository.findCompletedRequestsByNgoId(ngo.getNgoId());

        return requests.stream()
                .map(this::buildRequestResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get pending requests for restaurant
     */
    @Transactional(readOnly = true)
    public List<FoodRequestResponse> getPendingRequestsForRestaurant() {
        Long userId = SecurityUtil.getCurrentUserId();

        Restaurant restaurant = restaurantRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        List<FoodRequest> requests = requestRepository
                .findPendingRequestsByRestaurantId(restaurant.getRestaurantId());

        return requests.stream()
                .map(this::buildRequestResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all requests for restaurant
     */
    @Transactional(readOnly = true)
    public List<FoodRequestResponse> getAllRequestsForRestaurant() {
        Long userId = SecurityUtil.getCurrentUserId();

        Restaurant restaurant = restaurantRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        List<FoodRequest> requests = requestRepository
                .findByRestaurantId(restaurant.getRestaurantId());

        return requests.stream()
                .map(this::buildRequestResponse)
                .collect(Collectors.toList());
    }

    /**
     * Approve a request (Restaurant only)
     */
    @Transactional
    public FoodRequestResponse approveRequest(Long requestId, ApproveRequestDto dto) {
        Long userId = SecurityUtil.getCurrentUserId();

        FoodRequest request = requestRepository.findByIdWithDetails(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request", "id", requestId));

        // Verify ownership
        if (!request.getFoodListing().getRestaurant().getUser().getUserId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to approve this request");
        }

        // Validate request status
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new InvalidOperationException("Only pending requests can be approved");
        }

        // Validate pickup time
        if (dto.getPickupTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Pickup time cannot be in the past");
        }

        if (dto.getPickupTime().isAfter(request.getFoodListing().getExpiryTime())) {
            throw new BadRequestException("Pickup time cannot be after food expiry time");
        }

        // Lock and retrieve listing to prevent race conditions
        FoodListing listing = listingRepository.findByIdWithLock(request.getFoodListing().getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Food Listing not found"));

        if (!listing.isAvailable()) {
            throw new InvalidOperationException("Food listing is no longer available");
        }

        // Check availability
        if (listing.getQuantity() < request.getQuantityRequested()) {
            throw new InvalidOperationException("Insufficient quantity available. Current: " + listing.getQuantity());
        }

        // Deduct quantity
        listing.setQuantity(listing.getQuantity() - request.getQuantityRequested());

        // Update listing status
        if (listing.getQuantity() == 0) {
            listing.setStatus(ListingStatus.COMPLETED);
        } else {
            // Ensure it remains AVAILABLE if quantity > 0 (though it should already be available)
            listing.setStatus(ListingStatus.AVAILABLE);
        }
        
        listingRepository.save(listing);

        // Approve request
        request.approve(dto.getResponse(), dto.getPickupTime());
        request = requestRepository.save(request);
        logger.info("Request {} approved, listing quantity updated to {}", requestId, listing.getQuantity());

        return buildRequestResponse(request);
    }

    /**
     * Reject a request (Restaurant only)
     */
    @Transactional
    public FoodRequestResponse rejectRequest(Long requestId, RejectRequestDto dto) {
        Long userId = SecurityUtil.getCurrentUserId();

        FoodRequest request = requestRepository.findByIdWithDetails(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request", "id", requestId));

        // Verify ownership
        if (!request.getFoodListing().getRestaurant().getUser().getUserId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to reject this request");
        }

        // Validate request status
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new InvalidOperationException("Only pending requests can be rejected");
        }

        // Reject request
        request.reject(dto.getReason());
        request = requestRepository.save(request);

        logger.info("Request {} rejected", requestId);

        return buildRequestResponse(request);
    }

    /**
     * Mark request as picked up (NGO only)
     */
    @Transactional
    public FoodRequestResponse markAsPickedUp(Long requestId) {
        Long userId = SecurityUtil.getCurrentUserId();

        FoodRequest request = requestRepository.findByIdWithDetails(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request", "id", requestId));

        // Verify ownership
        if (!request.getNgo().getUser().getUserId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to update this request");
        }

        // Validate request status
        if (request.getStatus() != RequestStatus.APPROVED) {
            throw new InvalidOperationException("Only approved requests can be marked as picked up");
        }

        // Mark as picked up
        request.markAsPickedUp();
        request = requestRepository.save(request);

        logger.info("Request {} marked as picked up", requestId);

        return buildRequestResponse(request);
    }

    /**
     * Complete donation (NGO only)
     */
    @Transactional
    public FoodRequestResponse completeDonation(Long requestId, CompleteDonationRequest dto) {
        Long userId = SecurityUtil.getCurrentUserId();

        FoodRequest request = requestRepository.findByIdWithDetails(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request", "id", requestId));

        // Verify ownership
        if (!request.getNgo().getUser().getUserId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to complete this request");
        }

        // Validate request status
        if (request.getStatus() != RequestStatus.PICKED_UP) {
            throw new InvalidOperationException("Only picked up requests can be completed");
        }

        // Complete request
        request.complete();

        // Note: We do NOT set listing status to COMPLETED here.
        // Listing status is managed by quantity in approveRequest.
        // If there is valid quantity remaining, it stays AVAILABLE for other NGOs.


        // Create donation history
        createDonationHistory(request, dto);

        // Update restaurant statistics
        Restaurant restaurant = request.getFoodListing().getRestaurant();
        restaurant.incrementDonations(dto.getQuantityReceived() != null ? 
                dto.getQuantityReceived() : request.getQuantityRequested());
        
        if (dto.getRating() != null) {
            restaurant.updateRating(BigDecimal.valueOf(dto.getRating()));
        }
        restaurantRepository.save(restaurant);

        // Update NGO statistics
        Ngo ngo = request.getNgo();
        ngo.incrementReceived(dto.getQuantityReceived() != null ? 
                dto.getQuantityReceived() : request.getQuantityRequested());
        ngoRepository.save(ngo);

        request = requestRepository.save(request);
        logger.info("Request {} completed", requestId);

        return buildRequestResponse(request);
    }

    /**
     * Cancel request (NGO only)
     */
    @Transactional
    public void cancelRequest(Long requestId) {
        Long userId = SecurityUtil.getCurrentUserId();

        FoodRequest request = requestRepository.findByIdWithDetails(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request", "id", requestId));

        // Verify ownership
        if (!request.getNgo().getUser().getUserId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to cancel this request");
        }

        // Validate request status (can only cancel PENDING or APPROVED requests)
        if (request.getStatus() != RequestStatus.PENDING && 
            request.getStatus() != RequestStatus.APPROVED) {
            throw new InvalidOperationException("Cannot cancel request with status: " + request.getStatus());
        }

        // If request was approved, restore quantity to listing
        if (request.getStatus() == RequestStatus.APPROVED) {
            FoodListing listing = listingRepository.findByIdWithLock(request.getFoodListing().getListingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Food listing not found"));

            listing.setQuantity(listing.getQuantity() + request.getQuantityRequested());
            
            // If it was completed/expired/reserved, make it available again since we have quantity now
            // But only if it hasn't expired in the meantime
            if (!listing.isExpired()) {
                listing.setStatus(ListingStatus.AVAILABLE);
            }
            
            listingRepository.save(listing);
        }

        // Cancel request
        request.cancel();
        requestRepository.save(request);

        logger.info("Request {} cancelled", requestId);
    }

    /**
     * Get request details by ID
     */
    @Transactional(readOnly = true)
    public FoodRequestResponse getRequestById(Long requestId) {
        FoodRequest request = requestRepository.findByIdWithDetails(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request", "id", requestId));

        // Verify access (either restaurant or NGO owner)
        Long userId = SecurityUtil.getCurrentUserId();
        boolean hasAccess = request.getFoodListing().getRestaurant().getUser().getUserId().equals(userId)
                || request.getNgo().getUser().getUserId().equals(userId);

        if (!hasAccess) {
            throw new UnauthorizedException("You don't have permission to view this request");
        }

        return buildRequestResponse(request);
    }

    // Helper: Validate listing availability
    private void validateListingAvailability(FoodListing listing) {
        if (listing.getStatus() != ListingStatus.AVAILABLE) {
            throw new InvalidOperationException("This food listing is no longer available");
        }

        if (listing.isExpired()) {
            throw new InvalidOperationException("This food listing has expired");
        }
    }

    // Helper: Create donation history record
    private void createDonationHistory(FoodRequest request, CompleteDonationRequest dto) {
        DonationHistory history = DonationHistory.builder()
                .restaurant(request.getFoodListing().getRestaurant())
                .ngo(request.getNgo())
                .foodRequest(request)
                .foodName(request.getFoodListing().getFoodName())
                .quantityDonated(dto.getQuantityReceived() != null ? 
                        dto.getQuantityReceived() : request.getQuantityRequested())
                .category(request.getFoodListing().getCategory())
                .restaurantRating(dto.getRating())
                .ngoFeedback(dto.getFeedback())
                .build();

        donationHistoryRepository.save(history);
        logger.info("Donation history created for request: {}", request.getRequestId());
    }

    // Helper: Build request response DTO
    private FoodRequestResponse buildRequestResponse(FoodRequest request) {
        FoodListing listing = request.getFoodListing();
        Restaurant restaurant = listing.getRestaurant();
        Ngo ngo = request.getNgo();

        // Calculate distance
        double distance = matchingAlgorithmService.calculateDistance(
                ngo.getLatitude().doubleValue(),
                ngo.getLongitude().doubleValue(),
                restaurant.getLatitude().doubleValue(),
                restaurant.getLongitude().doubleValue()
        );

        return FoodRequestResponse.builder()
                .requestId(request.getRequestId())
                .listingId(listing.getListingId())
                .foodName(listing.getFoodName())
                .quantityRequested(request.getQuantityRequested())
                .urgencyLevel(request.getUrgencyLevel())
                .status(request.getStatus())
                .notes(request.getNotes())
                .restaurantResponse(request.getRestaurantResponse())
                .pickupTime(request.getPickupTime())
                .pickedUpAt(request.getPickedUpAt())
                .completedAt(request.getCompletedAt())
                .createdAt(request.getCreatedAt())
                .restaurantId(restaurant.getRestaurantId())
                .restaurantName(restaurant.getOrganizationName())
                .restaurantAddress(restaurant.getAddress())
                .restaurantPhone(restaurant.getUser().getPhone())
                .distance(Math.round(distance * 100.0) / 100.0)
                .ngoId(ngo.getNgoId())
                .ngoName(ngo.getOrganizationName())
                .beneficiaries(ngo.getBeneficiariesCount())
                .build();
    }
}


