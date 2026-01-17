package com.feedforward.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RejectRequestDto {

    @NotBlank(message = "Reason for rejection is required")
    private String reason;
}


