package com.feedforward.dto.response;

import com.feedforward.enums.RequestStatus;
import com.feedforward.enums.UrgencyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodRequestResponse {

    private Long requestId;
    private Long listingId;
    private String foodName;
    private Integer quantityRequested;
    private UrgencyLevel urgencyLevel;
    private RequestStatus status;
    private String notes;
    private String restaurantResponse;
    private LocalDateTime pickupTime;
    private LocalDateTime pickedUpAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;

    // Restaurant details
    private Long restaurantId;
    private String restaurantName;
    private String restaurantAddress;
    private String restaurantPhone;
    private Double distance;

    // NGO details
    private Long ngoId;
    private String ngoName;
    private Integer beneficiaries;
}


