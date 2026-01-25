package com.feedforward.service;

import com.feedforward.dto.response.NearbyNgoPlaceResponse;
import com.feedforward.dto.response.NearbyRestaurantResponse;
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

    @Value("${google.places.details-url:https://maps.googleapis.com/maps/api/place/details/json}")
    private String placeDetailsUrl;

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
        List<NearbyNgoPlaceResponse> sortedPlaces = byPlaceId.values().stream()
                .sorted(Comparator.comparingDouble(p -> p.getDistanceKm() != null ? p.getDistanceKm() : Double.MAX_VALUE))
                .toList();

        // Fetch phone numbers for top 10 places using Place Details API
        // Limit to top 10 to avoid excessive API calls (10 API calls max)
        List<NearbyNgoPlaceResponse> top10Places = sortedPlaces.stream()
                .limit(10)
                .map(this::enrichWithPlaceDetails)
                .toList();

        // Return top 10 with phone numbers (rest are not enriched to save API calls)
        return top10Places;
    }

    /**
     * Fetch phone number and website for a place using Place Details API
     */
    @SuppressWarnings("unchecked")
    private NearbyNgoPlaceResponse enrichWithPlaceDetails(NearbyNgoPlaceResponse place) {
        if (place.getPlaceId() == null || place.getPlaceId().isBlank()) {
            return place;
        }

        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl(placeDetailsUrl)
                    .queryParam("place_id", place.getPlaceId())
                    .queryParam("fields", "formatted_phone_number,international_phone_number,website")
                    .queryParam("key", apiKey)
                    .toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) return place;

            String status = Objects.toString(response.get("status"), "UNKNOWN");
            if (!"OK".equals(status)) {
                logger.debug("Place Details API returned status={} for place_id={}", status, place.getPlaceId());
                return place;
            }

            Object resultObj = response.get("result");
            if (!(resultObj instanceof Map<?, ?> result)) return place;

            // Extract phone number (prefer formatted, fallback to international)
            String phoneNumber = Objects.toString(result.get("formatted_phone_number"), null);
            if (phoneNumber == null || phoneNumber.isBlank()) {
                phoneNumber = Objects.toString(result.get("international_phone_number"), null);
            }

            // Extract website
            String website = Objects.toString(result.get("website"), null);

            // Update place with additional details
            return NearbyNgoPlaceResponse.builder()
                    .placeId(place.getPlaceId())
                    .name(place.getName())
                    .vicinity(place.getVicinity())
                    .latitude(place.getLatitude())
                    .longitude(place.getLongitude())
                    .distanceKm(place.getDistanceKm())
                    .mapsUrl(place.getMapsUrl())
                    .phoneNumber(phoneNumber)
                    .website(website)
                    .build();

        } catch (RestClientException ex) {
            logger.warn("Failed to fetch place details for place_id {}: {}", place.getPlaceId(), ex.getMessage());
            return place;
        } catch (Exception ex) {
            logger.warn("Unexpected error fetching place details for place_id {}: {}", place.getPlaceId(), ex.getMessage());
            return place;
        }
    }

    /**
     * Search Google Places around an NGO location for nearby restaurants.
     * Returns a merged, de-duplicated list by place_id.
     *
     * Note: This is optional and returns empty list if apiKey is not configured.
     */
    @SuppressWarnings("unchecked")
    public List<NearbyRestaurantResponse> findNearbyRestaurants(double ngoLat, double ngoLng, double radiusKm) {
        if (apiKey == null || apiKey.isBlank()) {
            logger.info("Google Places API key not configured; skipping nearby restaurant lookup");
            return Collections.emptyList();
        }

        int radiusMeters = (int) (radiusKm * 1000);
        // Keywords for restaurant search
        List<String> keywords = List.of("restaurant", "food", "hotel", "catering", "dining");

        Map<String, NearbyRestaurantResponse> byPlaceId = new LinkedHashMap<>();

        for (String keyword : keywords) {
            try {
                String url = UriComponentsBuilder
                        .fromHttpUrl(nearbySearchUrl)
                        .queryParam("location", ngoLat + "," + ngoLng)
                        .queryParam("radius", radiusMeters)
                        .queryParam("type", "restaurant")
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
                    String address = Objects.toString(vicinityObj, "");

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

                    double distanceKm = matchingAlgorithmService.calculateDistance(ngoLat, ngoLng, lat, lng);

                    // Get rating if available
                    Double rating = null;
                    Object ratingObj = item.get("rating");
                    if (ratingObj instanceof Number r) {
                        rating = r.doubleValue();
                    }

                    // Get types (cuisine types)
                    List<String> types = new ArrayList<>();
                    Object typesObj = item.get("types");
                    if (typesObj instanceof List<?> typesList) {
                        for (Object typeObj : typesList) {
                            if (typeObj instanceof String type) {
                                // Filter out generic types like "establishment", "point_of_interest"
                                if (!type.equals("establishment") && !type.equals("point_of_interest") && !type.equals("food")) {
                                    types.add(type);
                                }
                            }
                        }
                    }

                    // Provide a stable Maps URL
                    String mapsUrl = "https://www.google.com/maps/search/?api=1&query_place_id=" + placeId;

                    byPlaceId.putIfAbsent(placeId, NearbyRestaurantResponse.builder()
                            .placeId(placeId)
                            .name(name)
                            .address(address)
                            .latitude(lat)
                            .longitude(lng)
                            .distanceKm(Math.round(distanceKm * 100.0) / 100.0)
                            .rating(rating)
                            .types(types)
                            .mapsUrl(mapsUrl)
                            .isRegistered(false)
                            .build());
                }
            } catch (RestClientException ex) {
                logger.warn("Google Places restaurant lookup failed for keyword {}: {}", keyword, ex.getMessage());
            } catch (Exception ex) {
                logger.warn("Unexpected error in Google Places restaurant lookup for keyword {}: {}", keyword, ex.getMessage());
            }
        }

        // Sort by distance, closest first
        List<NearbyRestaurantResponse> sortedRestaurants = byPlaceId.values().stream()
                .sorted(Comparator.comparingDouble(p -> p.getDistanceKm() != null ? p.getDistanceKm() : Double.MAX_VALUE))
                .toList();

        // Fetch phone numbers for top 10 restaurants using Place Details API
        // Limit to top 10 to avoid excessive API calls (10 API calls max)
        List<NearbyRestaurantResponse> top10Restaurants = sortedRestaurants.stream()
                .limit(10)
                .map(this::enrichRestaurantWithPlaceDetails)
                .toList();

        // Return top 10 with phone numbers (rest are not enriched to save API calls)
        return top10Restaurants;
    }

    /**
     * Fetch phone number and website for a restaurant using Place Details API
     */
    @SuppressWarnings("unchecked")
    private NearbyRestaurantResponse enrichRestaurantWithPlaceDetails(NearbyRestaurantResponse restaurant) {
        if (restaurant.getPlaceId() == null || restaurant.getPlaceId().isBlank()) {
            return restaurant;
        }

        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl(placeDetailsUrl)
                    .queryParam("place_id", restaurant.getPlaceId())
                    .queryParam("fields", "formatted_phone_number,international_phone_number,website")
                    .queryParam("key", apiKey)
                    .toUriString();

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) return restaurant;

            String status = Objects.toString(response.get("status"), "UNKNOWN");
            if (!"OK".equals(status)) {
                logger.debug("Place Details API returned status={} for place_id={}", status, restaurant.getPlaceId());
                return restaurant;
            }

            Object resultObj = response.get("result");
            if (!(resultObj instanceof Map<?, ?> result)) return restaurant;

            // Extract phone number (prefer formatted, fallback to international)
            String phoneNumber = Objects.toString(result.get("formatted_phone_number"), null);
            if (phoneNumber == null || phoneNumber.isBlank()) {
                phoneNumber = Objects.toString(result.get("international_phone_number"), null);
            }

            // Extract website
            String website = Objects.toString(result.get("website"), null);

            // Update restaurant with additional details
            return NearbyRestaurantResponse.builder()
                    .placeId(restaurant.getPlaceId())
                    .name(restaurant.getName())
                    .address(restaurant.getAddress())
                    .latitude(restaurant.getLatitude())
                    .longitude(restaurant.getLongitude())
                    .distanceKm(restaurant.getDistanceKm())
                    .rating(restaurant.getRating())
                    .types(restaurant.getTypes())
                    .mapsUrl(restaurant.getMapsUrl())
                    .phoneNumber(phoneNumber)
                    .website(website)
                    .isRegistered(restaurant.getIsRegistered())
                    .build();

        } catch (RestClientException ex) {
            logger.warn("Failed to fetch place details for restaurant place_id {}: {}", restaurant.getPlaceId(), ex.getMessage());
            return restaurant;
        } catch (Exception ex) {
            logger.warn("Unexpected error fetching place details for restaurant place_id {}: {}", restaurant.getPlaceId(), ex.getMessage());
            return restaurant;
        }
    }
}


