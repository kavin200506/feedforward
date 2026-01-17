package com.feedforward.service;

import com.feedforward.dto.response.*;
import com.feedforward.entity.DonationHistory;
import com.feedforward.entity.Ngo;
import com.feedforward.entity.Restaurant;
import com.feedforward.exception.ResourceNotFoundException;
import com.feedforward.repository.*;
import com.feedforward.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final Logger logger = LoggerFactory.getLogger(DashboardService.class);

    private final RestaurantRepository restaurantRepository;
    private final NgoRepository ngoRepository;
    private final FoodListingRepository listingRepository;
    private final FoodRequestRepository requestRepository;
    private final DonationHistoryRepository donationHistoryRepository;

    /**
     * Get restaurant dashboard statistics
     */
    @Transactional(readOnly = true)
    public RestaurantDashboardResponse getRestaurantDashboard() {
        Long userId = SecurityUtil.getCurrentUserId();

        Restaurant restaurant = restaurantRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        // Get statistics
        long activeListings = listingRepository.countActiveListingsByRestaurant(restaurant.getRestaurantId());
        long pendingRequests = requestRepository.countPendingRequestsByRestaurant(restaurant.getRestaurantId());

        return RestaurantDashboardResponse.builder()
                .activeListings(activeListings)
                .pendingRequests(pendingRequests)
                .totalDonations(restaurant.getTotalDonations())
                .totalServingsDonated(restaurant.getTotalServingsDonated())
                .build();
    }

    /**
     * Get NGO dashboard statistics
     */
    @Transactional(readOnly = true)
    public NgoDashboardResponse getNgoDashboard() {
        Long userId = SecurityUtil.getCurrentUserId();

        Ngo ngo = ngoRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found"));

        // Get statistics
        long activeRequests = requestRepository.countActiveRequestsByNgo(ngo.getNgoId());

        // Calculate beneficiaries fed this month
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        List<DonationHistory> monthlyDonations = donationHistoryRepository
                .findByNgoAndDateRange(ngo.getNgoId(), monthStart, LocalDateTime.now());

        int beneficiariesFedThisMonth = monthlyDonations.stream()
                .mapToInt(DonationHistory::getQuantityDonated)
                .sum();

        return NgoDashboardResponse.builder()
                .activeRequests(activeRequests)
                .totalReceived(ngo.getTotalReceived())
                .totalServingsReceived(ngo.getTotalServingsReceived())
                .beneficiariesFedThisMonth(beneficiariesFedThisMonth)
                .build();
    }

    /**
     * Get global impact statistics
     */
    @Transactional(readOnly = true)
    public ImpactStatsResponse getImpactStatistics() {
        logger.info("Generating global impact statistics");

        // Basic counts
        long totalRestaurants = restaurantRepository.countActiveRestaurants();
        long totalNgos = ngoRepository.countActiveNgos();
        long totalDonations = donationHistoryRepository.getTotalDonationsCount();
        long totalServingsSaved = donationHistoryRepository.getTotalServingsDonated();
        long totalBeneficiaries = ngoRepository.getTotalBeneficiaries();
        long servingsSavedToday = donationHistoryRepository.getTodayServingsDonated();

        // Category distribution
        Map<String, Long> categoryDistribution = getCategoryDistribution();

        // Monthly trends (last 6 months)
        List<MonthlyStatResponse> monthlyTrends = getMonthlyTrends();

        // Top restaurants and NGOs
        List<RestaurantLeaderboardResponse> topRestaurants = getTopRestaurants();
        List<NgoLeaderboardResponse> topNgos = getTopNgos();

        // Environmental impact calculations
        double co2Saved = calculateCO2Saved(totalServingsSaved);
        double moneySaved = calculateMoneySaved(totalServingsSaved);

        return ImpactStatsResponse.builder()
                .totalRestaurants(totalRestaurants)
                .totalNgos(totalNgos)
                .totalDonations(totalDonations)
                .totalServingsSaved(totalServingsSaved)
                .totalBeneficiariesFed(totalBeneficiaries)
                .servingsSavedToday(servingsSavedToday)
                .categoryDistribution(categoryDistribution)
                .monthlyTrends(monthlyTrends)
                .topRestaurants(topRestaurants)
                .topNgos(topNgos)
                .co2Saved(co2Saved)
                .moneySaved(moneySaved)
                .build();
    }

    /**
     * Get restaurant leaderboard
     */
    @Transactional(readOnly = true)
    public List<RestaurantLeaderboardResponse> getTopRestaurants() {
        List<Restaurant> restaurants = restaurantRepository
                .findTopDonors(PageRequest.of(0, 10));

        int rank = 1;
        List<RestaurantLeaderboardResponse> leaderboard = new ArrayList<>();

        for (Restaurant restaurant : restaurants) {
            leaderboard.add(RestaurantLeaderboardResponse.builder()
                    .restaurantId(restaurant.getRestaurantId())
                    .name(restaurant.getOrganizationName())
                    .cuisineType(restaurant.getCuisineType())
                    .totalDonations(restaurant.getTotalDonations())
                    .totalServingsDonated(restaurant.getTotalServingsDonated())
                    .rating(restaurant.getRating())
                    .rank(rank++)
                    .build());
        }

        return leaderboard;
    }

    /**
     * Get NGO leaderboard
     */
    @Transactional(readOnly = true)
    public List<NgoLeaderboardResponse> getTopNgos() {
        List<Ngo> ngos = ngoRepository.findTopReceivers(PageRequest.of(0, 10));

        int rank = 1;
        List<NgoLeaderboardResponse> leaderboard = new ArrayList<>();

        for (Ngo ngo : ngos) {
            leaderboard.add(NgoLeaderboardResponse.builder()
                    .ngoId(ngo.getNgoId())
                    .name(ngo.getOrganizationName())
                    .beneficiariesCount(ngo.getBeneficiariesCount())
                    .totalReceived(ngo.getTotalReceived())
                    .totalServingsReceived(ngo.getTotalServingsReceived())
                    .rank(rank++)
                    .build());
        }

        return leaderboard;
    }

    // Helper: Get category-wise distribution
    private Map<String, Long> getCategoryDistribution() {
        List<Object[]> distribution = donationHistoryRepository.getCategoryWiseDistribution();

        Map<String, Long> result = new HashMap<>();
        for (Object[] row : distribution) {
            String category = row[0].toString();
            Long count = ((Number) row[2]).longValue(); // Total servings
            result.put(category, count);
        }

        return result;
    }

    // Helper: Get monthly trends
    private List<MonthlyStatResponse> getMonthlyTrends() {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<Object[]> stats = donationHistoryRepository.getMonthlyStatistics(sixMonthsAgo);

        return stats.stream()
                .map(row -> MonthlyStatResponse.builder()
                        .year(((Number) row[0]).intValue())
                        .month(((Number) row[1]).intValue())
                        .monthName(Month.of(((Number) row[1]).intValue()).name())
                        .donationCount(((Number) row[2]).longValue())
                        .totalServings(((Number) row[3]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    // Helper: Calculate CO2 saved (average 0.5 kg CO2 per serving)
    private double calculateCO2Saved(long servings) {
        return servings * 0.5;
    }

    // Helper: Calculate money saved (average ₹50 per serving)
    private double calculateMoneySaved(long servings) {
        return servings * 50.0;
    }
}


