package com.feedforward.dto.request;

import com.feedforward.enums.FoodCategory;
import com.feedforward.enums.UrgencyLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchFoodRequest {

    private Double distance = 10.0; // Default 10km radius
    private FoodCategory category;
    private UrgencyLevel urgencyLevel;
    private String dietaryInfo;
    private String searchTerm;
    private String sortBy = "expiry"; // expiry, distance, quantity
}


