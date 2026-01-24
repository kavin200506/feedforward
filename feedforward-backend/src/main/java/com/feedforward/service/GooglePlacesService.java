package com.feedforward.service;

import com.feedforward.dto.response.NearbyNgoPlaceResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GooglePlacesService {

    private static final Logger logger = LoggerFactory.getLogger(GooglePlacesService.class);

    private final MatchingAlgorithmService matchingAlgorithmService;

    @Value("${google.places.api-key:}")
    private String apiKey;

    @Value("${google.places.nearby-search-url:https://maps.googleapis.com/maps/api/place/nearbysearch/json}")
    private String nearbySearchUrl;

    @Value("${google.places.radius-meters:5000}")
    private int radiusMeters;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Search Google Places around a restaurant for NGO-like organizations.
     * Returns a merged, de-duplicated list by place_id.
     *
     * Note: This is optional and returns empty list if apiKey is not configured.
     */
    @SuppressWarnings("unchecked")
    public List<NearbyNgoPlaceResponse> findNearbyNgoPlaces(double restaurantLat, double restaurantLng) {
        if (apiKey == null || apiKey.isBlank()) {
            logger.info("Google Places API key not configured; skipping nearby NGO lookup");
            return Collections.emptyList();
        }

        // A small set of keywords gives decent coverage without too many API calls.
        List<String> keywords = List.of("ngo", "charity", "non profit", "community center", "social service");

        Map<String, NearbyNgoPlaceResponse> byPlaceId = new LinkedHashMap<>();

        for (String keyword : keywords) {
            try {
                String url = UriComponentsBuilder
                        .fromHttpUrl(nearbySearchUrl)
                        .queryParam("location", restaurantLat + "," + restaurantLng)
                        .queryParam("radius", radiusMeters)
                        .queryParam("keyword", keyword)
                        .queryParam("key", apiKey)
                        .toUriString();

                Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                if (response == null) continue;

                Object statusObj = response.get("status");
                String status = statusObj != null ? statusObj.toString() : "UNKNOWN";

                if (!"OK".equals(status) && !"ZERO_RESULTS".equals(status)) {
                    logger.warn("Google Places nearbysearch status={} keyword={} errorMessage={}",
                            status, keyword, response.getOrDefault("error_message", ""));
                    continue;
                }

                Object resultsObj = response.get("results");
                if (!(resultsObj instanceof List<?> results)) continue;

                for (Object itemObj : results) {
                    if (!(itemObj instanceof Map<?, ?> item)) continue;

                    String placeId = Objects.toString(item.get("place_id"), null);
                    if (placeId == null || placeId.isBlank()) continue;

                    String name = Objects.toString(item.get("name"), "");
                    Object vicinityObj = item.get("vicinity");
                    if (vicinityObj == null) {
                        vicinityObj = item.get("formatted_address");
                    }
                    String vicinity = Objects.toString(vicinityObj, "");

                    Double lat = null;
                    Double lng = null;
                    Object geometryObj = item.get("geometry");
                    if (geometryObj instanceof Map<?, ?> geometry) {
                        Object locationObj = geometry.get("location");
                        if (locationObj instanceof Map<?, ?> location) {
                            Object latObj = location.get("lat");
                            Object lngObj = location.get("lng");
                            if (latObj instanceof Number n1) lat = n1.doubleValue();
                            if (lngObj instanceof Number n2) lng = n2.doubleValue();
                        }
                    }

                    if (lat == null || lng == null) continue;

                    double distanceKm = matchingAlgorithmService.calculateDistance(
                            restaurantLat, restaurantLng, lat, lng
                    );

                    // Provide a stable Maps URL for inviting / viewing.
                    String mapsUrl = "https://www.google.com/maps/search/?api=1&query_place_id=" + placeId;

                    byPlaceId.putIfAbsent(placeId, NearbyNgoPlaceResponse.builder()
                            .placeId(placeId)
                            .name(name)
                            .vicinity(vicinity)
                            .latitude(lat)
                            .longitude(lng)
                            .distanceKm(Math.round(distanceKm * 100.0) / 100.0)
                            .mapsUrl(mapsUrl)
                            .build());
                }
            } catch (RestClientException ex) {
                logger.warn("Google Places lookup failed for keyword {}: {}", keyword, ex.getMessage());
            } catch (Exception ex) {
                logger.warn("Unexpected error in Google Places lookup for keyword {}: {}", keyword, ex.getMessage());
            }
        }

        // Sort by distance, closest first
        return byPlaceId.values().stream()
                .sorted(Comparator.comparingDouble(p -> p.getDistanceKm() != null ? p.getDistanceKm() : Double.MAX_VALUE))
                .toList();
    }
}


