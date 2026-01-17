package com.feedforward.dto.request;

import com.feedforward.enums.UrgencyLevel;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFoodRequestDto {

    @NotNull(message = "Listing ID is required")
    private Long listingId;

    @NotNull(message = "Quantity requested is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantityRequested;

    @NotNull(message = "Urgency level is required")
    private UrgencyLevel urgencyLevel;

    private String notes;
}


