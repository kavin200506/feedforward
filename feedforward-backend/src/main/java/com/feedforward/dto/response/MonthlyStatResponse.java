package com.feedforward.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyStatResponse {

    private Integer year;
    private Integer month;
    private String monthName;
    private Long donationCount;
    private Long totalServings;
}


