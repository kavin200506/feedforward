package com.feedforward.service;

import com.feedforward.dto.request.FoodListingRequest;
import com.feedforward.dto.request.SearchFoodRequest;
import com.feedforward.dto.response.FoodListingResponse;
import com.feedforward.dto.response.SuggestedNgoResponse;
import com.feedforward.entity.FoodListing;
import com.feedforward.entity.Ngo;
import com.feedforward.entity.Restaurant;
import com.feedforward.enums.ListingStatus;
import com.feedforward.enums.UrgencyLevel;
import com.feedforward.exception.BadRequestException;
import com.feedforward.exception.ResourceNotFoundException;
import com.feedforward.exception.UnauthorizedException;
import com.feedforward.repository.FoodListingRepository;
import com.feedforward.repository.NgoRepository;
import com.feedforward.repository.RestaurantRepository;
import com.feedforward.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodListingService {

    private static final Logger logger = LoggerFactory.getLogger(FoodListingService.class);

    private final FoodListingRepository foodListingRepository;
    private final RestaurantRepository restaurantRepository;
    private final NgoRepository ngoRepository;
    private final MatchingAlgorithmService matchingAlgorithmService;

    /**
     * Add new food listing (Restaurant only)
     */
    @Transactional
    public FoodListingResponse addFoodListing(FoodListingRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        logger.info("Adding food listing for user: {}", userId);

        // Get restaurant
        Restaurant restaurant = restaurantRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        // Validate dates
        validateListingDates(request);

        // Create food listing
        FoodListing listing = FoodListing.builder()
                .restaurant(restaurant)
                .foodName(request.getFoodName())
                .category(request.getCategory())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .preparedTime(request.getPreparedTime())
                .expiryTime(request.getExpiryTime())
                .dietaryInfo(request.getDietaryInfo())
                .description(request.getDescription())
                .status(ListingStatus.AVAILABLE)
                .build();

        // Calculate urgency (done in @PrePersist)
        listing = foodListingRepository.save(listing);
        logger.info("Food listing created with ID: {}", listing.getListingId());

        // Find suggested NGOs
        List<SuggestedNgoResponse> suggestedNgos = matchingAlgorithmService
                .findMatchingNgos(listing);

        return buildFoodListingResponse(listing, 0.0, suggestedNgos);
    }

    /**
     * Get all listings for a restaurant
     */
    @Transactional(readOnly = true)
    public List<FoodListingResponse> getMyListings() {
        Long userId = SecurityUtil.getCurrentUserId();

        Restaurant restaurant = restaurantRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        List<FoodListing> listings = foodListingRepository
                .findByRestaurantId(restaurant.getRestaurantId());

        return listings.stream()
                .map(listing -> buildFoodListingResponse(listing, 0.0, null))
                .collect(Collectors.toList());
    }

    /**
     * Get active listings for a restaurant
     */
    @Transactional(readOnly = true)
    public List<FoodListingResponse> getActiveListings() {
        Long userId = SecurityUtil.getCurrentUserId();

        Restaurant restaurant = restaurantRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        List<FoodListing> listings = foodListingRepository
                .findActiveListingsByRestaurantId(restaurant.getRestaurantId());

        return listings.stream()
                .map(listing -> buildFoodListingResponse(listing, 0.0, null))
                .collect(Collectors.toList());
    }

    /**
     * Search available food listings (NGO only)
     */
    @Transactional(readOnly = true)
    public List<FoodListingResponse> searchAvailableFood(SearchFoodRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();

        // Get NGO location
        Ngo ngo = ngoRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found"));

        // Search nearby listings
        List<FoodListing> listings = foodListingRepository.searchNearbyListings(
                ngo.getLatitude(),
                ngo.getLongitude(),
                request.getDistance(),
                request.getCategory() != null ? request.getCategory().name() : null,
                request.getUrgencyLevel() != null ? request.getUrgencyLevel().name() : null,
                request.getSearchTerm(),
                request.getSortBy()
        );

        // Calculate match scores and distance for each listing
        return listings.stream()
                .map(listing -> {
                    double distance = matchingAlgorithmService.calculateDistance(
                            ngo.getLatitude().doubleValue(),
                            ngo.getLongitude().doubleValue(),
                            listing.getRestaurant().getLatitude().doubleValue(),
                            listing.getRestaurant().getLongitude().doubleValue()
                    );

                    int matchScore = matchingAlgorithmService.calculateMatchScore(listing, ngo);

                    return buildFoodListingResponse(listing, distance, null, matchScore);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get listing details by ID
     */
    @Transactional(readOnly = true)
    public FoodListingResponse getListingById(Long listingId) {
        FoodListing listing = foodListingRepository.findByIdWithRestaurant(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Food listing", "id", listingId));

        // Calculate distance if NGO is viewing
        double distance = 0.0;
        if (SecurityUtil.isNgo()) {
            Long userId = SecurityUtil.getCurrentUserId();
            Ngo ngo = ngoRepository.findByUser_UserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("NGO not found"));

            distance = matchingAlgorithmService.calculateDistance(
                    ngo.getLatitude().doubleValue(),
                    ngo.getLongitude().doubleValue(),
                    listing.getRestaurant().getLatitude().doubleValue(),
                    listing.getRestaurant().getLongitude().doubleValue()
            );
        }

        return buildFoodListingResponse(listing, distance, null);
    }

    /**
     * Update listing status
     */
    @Transactional
    public void updateListingStatus(Long listingId, ListingStatus status) {
        FoodListing listing = foodListingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Food listing", "id", listingId));

        // Verify ownership
        Long userId = SecurityUtil.getCurrentUserId();
        if (!listing.getRestaurant().getUser().getUserId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to update this listing");
        }

        listing.setStatus(status);
        foodListingRepository.save(listing);

        logger.info("Listing {} status updated to {}", listingId, status);
    }

    /**
     * Delete listing (soft delete by marking as expired)
     */
    @Transactional
    public void deleteListing(Long listingId) {
        FoodListing listing = foodListingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Food listing", "id", listingId));

        // Verify ownership
        Long userId = SecurityUtil.getCurrentUserId();
        if (!listing.getRestaurant().getUser().getUserId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to delete this listing");
        }

        listing.setStatus(ListingStatus.EXPIRED);
        foodListingRepository.save(listing);

        logger.info("Listing {} marked as expired", listingId);
    }

    // Helper: Validate listing dates
    private void validateListingDates(FoodListingRequest request) {
        LocalDateTime now = LocalDateTime.now();

        if (request.getPreparedTime().isAfter(now)) {
            throw new BadRequestException("Prepared time cannot be in the future");
        }

        if (request.getExpiryTime().isBefore(now)) {
            throw new BadRequestException("Expiry time must be in the future");
        }

        if (request.getExpiryTime().isBefore(request.getPreparedTime())) {
            throw new BadRequestException("Expiry time must be after prepared time");
        }

        // Check if food expires within minimum time (15 minutes from now)
        if (request.getExpiryTime().isBefore(now.plusMinutes(15))) {
            throw new BadRequestException("Food must be available for at least 15 minutes");
        }
    }

    // Helper: Build food listing response
    private FoodListingResponse buildFoodListingResponse(
            FoodListing listing,
            Double distance,
            List<SuggestedNgoResponse> suggestedNgos
    ) {
        return buildFoodListingResponse(listing, distance, suggestedNgos, null);
    }

    private FoodListingResponse buildFoodListingResponse(
            FoodListing listing,
            Double distance,
            List<SuggestedNgoResponse> suggestedNgos,
            Integer matchScore
    ) {
        // Calculate time remaining
        String timeRemaining = calculateTimeRemaining(listing.getExpiryTime());
        String urgencyColor = getUrgencyColor(listing.getUrgencyLevel());

        return FoodListingResponse.builder()
                .listingId(listing.getListingId())
                .foodName(listing.getFoodName())
                .category(listing.getCategory())
                .categoryEmoji(listing.getCategory().getEmoji())
                .quantity(listing.getQuantity())
                .unit(listing.getUnit())
                .preparedTime(listing.getPreparedTime())
                .expiryTime(listing.getExpiryTime())
                .dietaryInfo(listing.getDietaryInfo())
                .description(listing.getDescription())
                .status(listing.getStatus())
                .urgencyLevel(listing.getUrgencyLevel())
                .urgencyColor(urgencyColor)
                .timeRemaining(timeRemaining)
                .createdAt(listing.getCreatedAt())
                .restaurantId(listing.getRestaurant().getRestaurantId())
                .restaurantName(listing.getRestaurant().getOrganizationName())
                .restaurantAddress(listing.getRestaurant().getAddress())
                .restaurantPhone(listing.getRestaurant().getUser().getPhone())
                .distance(distance)
                .matchScore(matchScore)
                .suggestedNgos(suggestedNgos)
                .build();
    }

    // Helper: Calculate time remaining in human-readable format
    private String calculateTimeRemaining(LocalDateTime expiryTime) {
        Duration duration = Duration.between(LocalDateTime.now(), expiryTime);

        if (duration.isNegative()) {
            return "Expired";
        }

        long hours = duration.toHours();
        long minutes = duration.toMinutes() % 60;

        if (hours > 0) {
            return String.format("%dh %dm", hours, minutes);
        } else {
            return String.format("%dm", minutes);
        }
    }

    // Helper: Get urgency color code
    private String getUrgencyColor(UrgencyLevel urgencyLevel) {
        return switch (urgencyLevel) {
            case CRITICAL -> "#F44336"; // Red
            case HIGH -> "#FF9800";     // Orange
            case MEDIUM -> "#FFC107";   // Yellow
            case LOW -> "#4CAF50";      // Green
        };
    }
}

