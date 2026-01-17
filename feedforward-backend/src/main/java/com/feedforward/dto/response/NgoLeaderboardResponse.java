package com.feedforward.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NgoLeaderboardResponse {

    private Long ngoId;
    private String name;
    private Integer beneficiariesCount;
    private Integer totalReceived;
    private Integer totalServingsReceived;
    private Integer rank;
}


