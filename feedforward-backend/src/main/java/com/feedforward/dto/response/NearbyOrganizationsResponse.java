package com.feedforward.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NearbyOrganizationsResponse {
    private List<NgoWithContactResponse> registeredNgos;
    private List<NearbyNgoPlaceResponse> unregisteredNgos;
    private Integer notifiedCount;
}



