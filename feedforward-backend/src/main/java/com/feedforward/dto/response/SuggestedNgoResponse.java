package com.feedforward.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuggestedNgoResponse {

    private Long ngoId;
    private String name;
    private Double distance; // in km
    private Integer beneficiaries;
    private Integer matchScore; // 0-100
    private String reason;
}


