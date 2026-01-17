package com.feedforward.service;

import com.feedforward.dto.response.SuggestedNgoResponse;
import com.feedforward.entity.FoodListing;
import com.feedforward.entity.Ngo;
import com.feedforward.repository.NgoRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchingAlgorithmService {

    private static final Logger logger = LoggerFactory.getLogger(MatchingAlgorithmService.class);
    private static final double MAX_DISTANCE_KM = 25.0; // Maximum matching distance
    private static final int MAX_SUGGESTIONS = 5; // Top N suggestions

    private final NgoRepository ngoRepository;

    /**
     * Find matching NGOs for a food listing using AI-based scoring
     */
    public List<SuggestedNgoResponse> findMatchingNgos(FoodListing listing) {
        logger.info("Finding matching NGOs for listing: {}", listing.getListingId());

        // Get all NGOs within maximum distance
        List<Ngo> nearbyNgos = ngoRepository.findNgosWithinRadius(
                listing.getRestaurant().getLatitude(),
                listing.getRestaurant().getLongitude(),
                MAX_DISTANCE_KM
        );

        // Calculate match score for each NGO
        List<SuggestedNgoResponse> suggestions = new ArrayList<>();
        for (Ngo ngo : nearbyNgos) {
            double distance = calculateDistance(
                    listing.getRestaurant().getLatitude().doubleValue(),
                    listing.getRestaurant().getLongitude().doubleValue(),
                    ngo.getLatitude().doubleValue(),
                    ngo.getLongitude().doubleValue()
            );

            int matchScore = calculateMatchScore(listing, ngo);
            String reason = generateMatchReason(listing, ngo, distance);

            suggestions.add(SuggestedNgoResponse.builder()
                    .ngoId(ngo.getNgoId())
                    .name(ngo.getOrganizationName())
                    .distance(Math.round(distance * 100.0) / 100.0)
                    .beneficiaries(ngo.getBeneficiariesCount())
                    .matchScore(matchScore)
                    .reason(reason)
                    .build());
        }

        // Sort by match score (descending) and return top N
        return suggestions.stream()
                .sorted(Comparator.comparingInt(SuggestedNgoResponse::getMatchScore).reversed())
                .limit(MAX_SUGGESTIONS)
                .collect(Collectors.toList());
    }

    /**
     * Calculate match score between food listing and NGO (0-100)
     */
    public int calculateMatchScore(FoodListing listing, Ngo ngo) {
        int score = 0;

        // 1. Distance Score (40 points) - Closer is better
        double distance = calculateDistance(
                listing.getRestaurant().getLatitude().doubleValue(),
                listing.getRestaurant().getLongitude().doubleValue(),
                ngo.getLatitude().doubleValue(),
                ngo.getLongitude().doubleValue()
        );

        if (distance <= 2.0) {
            score += 40;
        } else if (distance <= 5.0) {
            score += 30;
        } else if (distance <= 10.0) {
            score += 20;
        } else if (distance <= 15.0) {
            score += 10;
        }

        // 2. Quantity Match Score (25 points) - Matches beneficiary needs
        int quantityScore = calculateQuantityMatchScore(listing.getQuantity(), ngo.getBeneficiariesCount());
        score += quantityScore;

        // 3. Urgency Score (20 points) - More urgent = higher priority
        score += calculateUrgencyScore(listing.getExpiryTime());

        // 4. Dietary Match Score (15 points) - Dietary preferences alignment
        if (listing.getDietaryInfo() != null && ngo.getDietaryRequirements() != null) {
            score += calculateDietaryMatchScore(listing.getDietaryInfo(), ngo.getDietaryRequirements());
        } else {
            score += 10; // Default if no dietary restrictions
        }

        return Math.min(score, 100); // Cap at 100
    }

    /**
     * Calculate distance between two points using Haversine formula (in km)
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    // Helper: Calculate quantity match score
    private int calculateQuantityMatchScore(int foodQuantity, int beneficiaries) {
        // Ideal: Food quantity covers 20-30% of beneficiaries (1 serving per person)
        int idealMin = (int) (beneficiaries * 0.2);
        int idealMax = (int) (beneficiaries * 0.3);

        if (foodQuantity >= idealMin && foodQuantity <= idealMax) {
            return 25; // Perfect match
        } else if (foodQuantity >= beneficiaries * 0.1 && foodQuantity <= beneficiaries * 0.5) {
            return 20; // Good match
        } else if (foodQuantity >= beneficiaries * 0.05) {
            return 15; // Acceptable
        } else {
            return 10; // Low match
        }
    }

    // Helper: Calculate urgency score
    private int calculateUrgencyScore(LocalDateTime expiryTime) {
        Duration duration = Duration.between(LocalDateTime.now(), expiryTime);
        long hoursRemaining = duration.toHours();

        if (hoursRemaining < 1) {
            return 20; // Critical urgency
        } else if (hoursRemaining < 2) {
            return 15; // High urgency
        } else if (hoursRemaining < 4) {
            return 10; // Medium urgency
        } else {
            return 5; // Low urgency
        }
    }

    // Helper: Calculate dietary match score
    private int calculateDietaryMatchScore(String foodDietaryInfo, String ngoDietaryRequirements) {
        String foodInfo = foodDietaryInfo.toLowerCase();
        String ngoRequirements = ngoDietaryRequirements.toLowerCase();

        // Check for conflicts
        if (ngoRequirements.contains("veg") && foodInfo.contains("non-veg")) {
            return 0; // No match
        }

        // Check for matches
        int matches = 0;
        String[] requirements = ngoRequirements.split(",");
        for (String req : requirements) {
            if (foodInfo.contains(req.trim())) {
                matches++;
            }
        }

        return Math.min(matches * 5, 15); // 5 points per match, max 15
    }

    // Helper: Generate human-readable match reason
    private String generateMatchReason(FoodListing listing, Ngo ngo, double distance) {
        StringBuilder reason = new StringBuilder();

        // Distance reason
        if (distance < 2.0) {
            reason.append("Very close proximity (").append(String.format("%.1f", distance)).append(" km). ");
        } else if (distance < 5.0) {
            reason.append("Within nearby area (").append(String.format("%.1f", distance)).append(" km). ");
        }

        // Quantity reason
        int idealServings = (int) (ngo.getBeneficiariesCount() * 0.25);
        if (Math.abs(listing.getQuantity() - idealServings) < 20) {
            reason.append("Quantity matches your beneficiary needs. ");
        }

        // Urgency reason
        Duration duration = Duration.between(LocalDateTime.now(), listing.getExpiryTime());
        if (duration.toHours() < 2) {
            reason.append("Urgent pickup needed - expires soon!");
        }

        return reason.toString().trim();
    }
}


