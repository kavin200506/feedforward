package com.feedforward.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NgoWithContactResponse {
    private Long ngoId;
    private String organizationName;
    private String phone;
    private String email;
    private String address;
    private Double distanceKm;
    private Integer beneficiariesCount;
    private String dietaryRequirements;
    private Boolean isRegistered;
}




