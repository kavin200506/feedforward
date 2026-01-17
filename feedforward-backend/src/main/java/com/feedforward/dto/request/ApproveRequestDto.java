package com.feedforward.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApproveRequestDto {

    @NotBlank(message = "Response message is required")
    private String response;

    @NotNull(message = "Pickup time is required")
    private LocalDateTime pickupTime;
}


