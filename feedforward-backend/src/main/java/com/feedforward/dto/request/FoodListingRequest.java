package com.feedforward.dto.request;

import com.feedforward.enums.FoodCategory;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoodListingRequest {

    @NotBlank(message = "Food name is required")
    private String foodName;

    @NotNull(message = "Category is required")
    private FoodCategory category;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotNull(message = "Prepared time is required")
    private LocalDateTime preparedTime;

    @NotNull(message = "Expiry time is required")
    private LocalDateTime expiryTime;

    private String dietaryInfo;

    private String description;
}


