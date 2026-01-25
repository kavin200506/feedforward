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
public class SearchFoodWithNearbyResponse {
    // Registered restaurants with available food
    private List<FoodListingResponse> registeredResults;
    
    // Nearby unregistered restaurants from Google Maps
    private List<NearbyRestaurantResponse> nearbyRestaurants;
    
    // Counts
    private Integer totalRegistered;
    private Integer totalNearby;
}





