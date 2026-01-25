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
public class NearbyRestaurantResponse {
    private String placeId;
    private String name;
    private String address; // vicinity or formatted_address from Places API
    private Double latitude;
    private Double longitude;
    private Double distanceKm; // computed from NGO location
    private Double rating; // Google rating if available
    private List<String> types; // cuisine types from Google Places
    private String mapsUrl; // deep link to Google Maps
    private String phoneNumber; // phone number from Place Details API (optional)
    private String website; // website URL from Place Details API (optional)
    private Boolean isRegistered; // false for unregistered restaurants
}





