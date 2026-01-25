package com.feedforward.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.feedforward.enums.UrgencyLevel;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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

    @NotNull(message = "Pickup time is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime pickupTime;

    private String notes;
}


