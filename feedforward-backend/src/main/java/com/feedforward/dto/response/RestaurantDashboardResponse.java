package com.feedforward.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantDashboardResponse {

    private Long activeListings;
    private Long pendingRequests;
    private Integer totalDonations;
    private Integer totalServingsDonated;
    private List<FoodListingResponse> recentListings;
    private List<FoodRequestResponse> pendingRequestsList;
}


