package com.feedforward.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {

    private Long userId;
    private String email;
    private String name;
    private String phone;
    private String role;
    private String organizationName;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;

    // Restaurant specific
    private String cuisineType;
    private BigDecimal rating;
    private Integer totalDonations;
    private Integer totalServingsDonated;

    // NGO specific
    private Integer beneficiariesCount;
    private String foodPreferences;
    private String dietaryRequirements;
    private Integer totalReceived;
    private Integer totalServingsReceived;
}


