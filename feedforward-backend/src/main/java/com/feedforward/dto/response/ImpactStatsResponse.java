package com.feedforward.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImpactStatsResponse {

    // Global Statistics
    private Long totalRestaurants;
    private Long totalNgos;
    private Long totalDonations;
    private Long totalServingsSaved;
    private Long totalBeneficiariesFed;
    private Long servingsSavedToday;

    // Category breakdown
    private Map<String, Long> categoryDistribution;

    // Monthly trends
    private List<MonthlyStatResponse> monthlyTrends;

    // Top contributors
    private List<RestaurantLeaderboardResponse> topRestaurants;
    private List<NgoLeaderboardResponse> topNgos;

    // Environmental impact
    private Double co2Saved; // in kg
    private Double moneySaved; // in rupees
}


