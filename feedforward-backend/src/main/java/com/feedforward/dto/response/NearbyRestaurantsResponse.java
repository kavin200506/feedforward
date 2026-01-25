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
public class NearbyRestaurantsResponse {
    private List<RestaurantWithContactResponse> registeredRestaurants;
    private List<NearbyRestaurantResponse> unregisteredRestaurants;
    private Integer notifiedCount;
}




