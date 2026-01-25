package com.feedforward.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NearbyNgoPlaceResponse {
    private String placeId;
    private String name;
    private String vicinity; // human-readable address snippet from Places API
    private Double latitude;
    private Double longitude;
    private Double distanceKm; // computed from restaurant location
    private String mapsUrl; // deep link to Google Maps
    private String phoneNumber; // phone number from Place Details API (optional)
    private String website; // website URL from Place Details API (optional)
}


