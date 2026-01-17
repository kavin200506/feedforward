package com.feedforward.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantLeaderboardResponse {

    private Long restaurantId;
    private String name;
    private String cuisineType;
    private Integer totalDonations;
    private Integer totalServingsDonated;
    private BigDecimal rating;
    private Integer rank;
}


