package com.feedforward.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UrgentNeedRequest {
    private Integer quantityNeeded;
    private String foodPreference; // VEGETARIAN, NON_VEG, ALL
}



