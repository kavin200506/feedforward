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
public class NgoDashboardResponse {

    private Long activeRequests;
    private Integer totalReceived;
    private Integer totalServingsReceived;
    private Integer beneficiariesFedThisMonth;
    private List<FoodRequestResponse> activeRequestsList;
    private List<FoodListingResponse> suggestedFood;
}


