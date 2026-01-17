package com.feedforward.dto.request;

import com.feedforward.enums.Role;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    // User Details
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Please provide a valid 10-digit phone number")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    // Organization Details
    @NotBlank(message = "Organization name is required")
    private String organizationName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private BigDecimal longitude;

    // Restaurant Specific
    private String cuisineType;

    // NGO Specific
    @Min(value = 1, message = "Beneficiaries count must be at least 1")
    private Integer beneficiariesCount;

    private String foodPreferences;
    private String dietaryRequirements;
}


