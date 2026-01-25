package com.feedforward.dto.response;

import com.feedforward.enums.FoodCategory;
import com.feedforward.enums.ListingStatus;
import com.feedforward.enums.UrgencyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodListingResponse {

    private Long listingId;
    private String foodName;
    private FoodCategory category;
    private String categoryEmoji;
    private Integer quantity;
    private String unit;
    private LocalDateTime preparedTime;
    private LocalDateTime expiryTime;
    private String dietaryInfo;
    private String description;
    private ListingStatus status;
    private UrgencyLevel urgencyLevel;
    private String urgencyColor;
    private String timeRemaining;
    private LocalDateTime createdAt;

    // Restaurant details
    private Long restaurantId;
    private String restaurantName;
    private String restaurantAddress;
    private String restaurantPhone;
    private Double distance; // in km (calculated for NGO searches)
    private Integer matchScore; // matching score for NGO (0-100)
    private String matchReason;

    // Statistics
    private Integer requestCount;
    private List<SuggestedNgoResponse> suggestedNgos;
    private List<NearbyNgoPlaceResponse> nearbyNgoPlaces; // Google Places results (may include unregistered NGOs)
}


