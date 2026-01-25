package com.feedforward.service;

import com.feedforward.dto.response.NearbyNgoPlaceResponse;
import com.feedforward.dto.response.NearbyOrganizationsResponse;
import com.feedforward.dto.response.NearbyRestaurantResponse;
import com.feedforward.dto.response.NearbyRestaurantsResponse;
import com.feedforward.dto.response.NgoWithContactResponse;
import com.feedforward.dto.response.RestaurantWithContactResponse;
import com.feedforward.entity.FoodListing;
import com.feedforward.entity.Ngo;
import com.feedforward.entity.Restaurant;
import com.feedforward.repository.NgoRepository;
import com.feedforward.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final SmsService smsService;
    private final NgoRepository ngoRepository;
    private final RestaurantRepository restaurantRepository;
    private final MatchingAlgorithmService matchingAlgorithmService;
    private final GooglePlacesService googlePlacesService;

    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;

    @Value("${app.name:FeedForward}")
    private String appName;

    private static final int TOP_N = 5; // Top 5 organizations

    /**
     * Notify nearby NGOs when restaurant adds food listing
     */
    public int notifyNearbyNgos(FoodListing foodListing, Restaurant restaurant) {
        try {
            // Find nearby NGOs (within 10 km)
            List<Ngo> nearbyNgos = findNearbyNgos(
                    restaurant.getLatitude().doubleValue(),
                    restaurant.getLongitude().doubleValue(),
                    10.0
            );

            // Filter by dietary preference
            nearbyNgos = filterByDietaryMatch(nearbyNgos, foodListing);

            if (nearbyNgos.isEmpty()) {
                logger.info("No nearby NGOs found to notify");
                return 0;
            }

            // Calculate urgency
            long hoursUntilExpiry = ChronoUnit.HOURS.between(
                    LocalDateTime.now(),
                    foodListing.getExpiryTime()
            );

            String urgency = "";
            if (hoursUntilExpiry <= 2) {
                urgency = "URGENT";
            } else if (hoursUntilExpiry <= 4) {
                urgency = "HIGH PRIORITY";
            }

            // Build SMS message (160 chars limit for single SMS)
            String smsMessage = buildFoodAvailableSms(
                    restaurant.getOrganizationName(),
                    foodListing.getFoodName(),
                    foodListing.getQuantity(),
                    foodListing.getCategory().getDisplayName(),
                    hoursUntilExpiry,
                    urgency
            );

            // Collect phone numbers from User entities
            List<String> phoneNumbers = nearbyNgos.stream()
                    .map(ngo -> ngo.getUser() != null ? ngo.getUser().getPhone() : null)
                    .filter(phone -> phone != null && !phone.isEmpty())
                    .filter(smsService::isValidIndianMobile)
                    .collect(Collectors.toList());

            if (phoneNumbers.isEmpty()) {
                logger.warn("No valid phone numbers found for NGOs");
                return 0;
            }

            // Send SMS (Fast2SMS supports bulk sending)
            boolean sent = smsService.sendSms(phoneNumbers, smsMessage);

            int notifiedCount = sent ? phoneNumbers.size() : 0;
            logger.info("Notified {} NGOs via SMS", notifiedCount);

            return notifiedCount;

        } catch (Exception e) {
            logger.error("Error in notifyNearbyNgos: {}", e.getMessage(), e);
            return 0;
        }
    }

    /**
     * Build SMS message for food availability (max 160 chars)
     */
    private String buildFoodAvailableSms(
            String restaurantName,
            String foodName,
            Integer quantity,
            String category,
            long hoursLeft,
            String urgency
    ) {
        // Short format to fit in 160 characters
        String urgencyPrefix = urgency.isEmpty() ? "🍽️" : "⚠️ " + urgency;
        String message = String.format(
                "%s %s: %s (%d servings, %s) available for %dh. Login to %s to request.",
                urgencyPrefix,
                restaurantName.length() > 20 ? restaurantName.substring(0, 20) : restaurantName,
                foodName.length() > 15 ? foodName.substring(0, 15) : foodName,
                quantity,
                category.length() > 10 ? category.substring(0, 10) : category,
                hoursLeft,
                appName
        );

        // Truncate if too long (keep under 160 chars)
        if (message.length() > 160) {
            message = message.substring(0, 157) + "...";
        }

        return message;
    }

    /**
     * Find NGOs within radius using Haversine formula
     * Fetches user relationship to avoid LazyInitializationException
     */
    private List<Ngo> findNearbyNgos(double lat, double lng, double radiusKm) {
        // Use repository method that eagerly fetches user relationship
        List<Ngo> allNgos = ngoRepository.findAllWithUser();
        List<Ngo> nearbyNgos = new ArrayList<>();

        for (Ngo ngo : allNgos) {
            // Skip if no location
            if (ngo.getLatitude() == null || ngo.getLongitude() == null) {
                continue;
            }

            // User is already loaded, so we can safely check isActive
            if (ngo.getUser() != null && !ngo.getUser().getIsActive()) {
                continue;
            }

            double distance = matchingAlgorithmService.calculateDistance(
                    lat, lng,
                    ngo.getLatitude().doubleValue(),
                    ngo.getLongitude().doubleValue()
            );

            if (distance <= radiusKm) {
                nearbyNgos.add(ngo);
            }
        }

        return nearbyNgos;
    }

    /**
     * Filter NGOs by dietary preference match
     */
    private List<Ngo> filterByDietaryMatch(List<Ngo> ngos, FoodListing foodListing) {
        return ngos.stream()
                .filter(ngo -> {
                    // If NGO has no preference, include
                    String dietaryReq = ngo.getDietaryRequirements();
                    if (dietaryReq == null || dietaryReq.trim().isEmpty() ||
                            dietaryReq.toLowerCase().contains("all")) {
                        return true;
                    }

                    // Match dietary preference
                    String foodCategory = foodListing.getCategory().name().toLowerCase();
                    String ngoPreference = dietaryReq.toLowerCase();

                    // Vegetarian match
                    if (foodCategory.contains("veg") && ngoPreference.contains("veg")) {
                        return true;
                    }

                    // Non-veg match
                    if ((foodCategory.contains("protein") || foodCategory.contains("meat")) &&
                            ngoPreference.contains("non")) {
                        return true;
                    }

                    // Vegan match
                    if (foodCategory.contains("vegan") && ngoPreference.contains("vegan")) {
                        return true;
                    }

                    return false;
                })
                .collect(Collectors.toList());
    }

    /**
     * OPTIONAL: Notify restaurants when NGO has urgent need
     */
    public int notifyNearbyRestaurants(Ngo ngo, int quantityNeeded, String foodPreference) {
        try {
            List<Restaurant> nearbyRestaurants = findNearbyRestaurants(
                    ngo.getLatitude().doubleValue(),
                    ngo.getLongitude().doubleValue(),
                    10.0
            );

            String message = String.format(
                    "🤝 %s needs %d servings of %s food. Help feed %d beneficiaries. Login to %s to donate.",
                    ngo.getOrganizationName(),
                    quantityNeeded,
                    foodPreference.toLowerCase(),
                    ngo.getBeneficiariesCount(),
                    appName
            );

            List<String> phoneNumbers = nearbyRestaurants.stream()
                    .map(r -> r.getUser() != null ? r.getUser().getPhone() : null)
                    .filter(phone -> phone != null && !phone.isEmpty())
                    .filter(smsService::isValidIndianMobile)
                    .collect(Collectors.toList());

            if (phoneNumbers.isEmpty()) {
                return 0;
            }

            boolean sent = smsService.sendSms(phoneNumbers, message);
            return sent ? phoneNumbers.size() : 0;
        } catch (Exception e) {
            logger.error("Error in notifyNearbyRestaurants: {}", e.getMessage(), e);
            return 0;
        }
    }

    private List<Restaurant> findNearbyRestaurants(double lat, double lng, double radiusKm) {
        // Use repository method that eagerly fetches user relationship
        List<Restaurant> allRestaurants = restaurantRepository.findAllWithUser();
        return allRestaurants.stream()
                .filter(r -> r.getLatitude() != null && r.getLongitude() != null)
                .filter(r -> r.getUser() != null && r.getUser().getIsActive())
                .filter(r -> {
                    double distance = matchingAlgorithmService.calculateDistance(lat, lng,
                            r.getLatitude().doubleValue(),
                            r.getLongitude().doubleValue());
                    return distance <= radiusKm;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get top 5 registered + top 5 unregistered NGOs near restaurant
     * Send SMS/Email to top 5 registered only
     */
    public NearbyOrganizationsResponse getAndNotifyNearbyNgos(
            FoodListing foodListing,
            Restaurant restaurant
    ) {
        // Find all nearby registered NGOs
        List<Ngo> nearbyNgos = findNearbyNgos(
                restaurant.getLatitude().doubleValue(),
                restaurant.getLongitude().doubleValue(),
                10.0
        );

        // Filter by dietary preference
        nearbyNgos = filterByDietaryMatch(nearbyNgos, foodListing);

        // Sort by distance and get top 5 with contact info
        List<NgoWithContactResponse> top5RegisteredNgos = nearbyNgos.stream()
                .map(ngo -> {
                    double distance = matchingAlgorithmService.calculateDistance(
                            restaurant.getLatitude().doubleValue(),
                            restaurant.getLongitude().doubleValue(),
                            ngo.getLatitude().doubleValue(),
                            ngo.getLongitude().doubleValue()
                    );
                    return buildNgoWithContact(ngo, distance);
                })
                .filter(ngo -> ngo != null) // Filter out null responses
                .sorted(Comparator.comparing(NgoWithContactResponse::getDistanceKm))
                .limit(TOP_N)
                .collect(Collectors.toList());

        // Send SMS/Email to top 5 registered NGOs
        int notifiedCount = 0;
        if (!top5RegisteredNgos.isEmpty()) {
            notifiedCount = notifyRegisteredNgos(
                    top5RegisteredNgos,
                    foodListing,
                    restaurant
            );
        }

        // Find top 5 unregistered NGOs from Google Places
        List<NearbyNgoPlaceResponse> top5UnregisteredNgos = new ArrayList<>();
        try {
            List<NearbyNgoPlaceResponse> googleNgos = googlePlacesService.findNearbyNgoPlaces(
                    restaurant.getLatitude().doubleValue(),
                    restaurant.getLongitude().doubleValue()
            );

            // Remove duplicates (already registered)
            Set<String> registeredNames = nearbyNgos.stream()
                    .map(n -> n.getOrganizationName().toLowerCase().trim())
                    .collect(Collectors.toSet());

            top5UnregisteredNgos = googleNgos.stream()
                    .filter(gn -> {
                        String name = gn.getName() != null ? gn.getName().toLowerCase().trim() : "";
                        return name.isEmpty() || !registeredNames.contains(name);
                    })
                    .sorted(Comparator.comparing(n -> n.getDistanceKm() != null ? n.getDistanceKm() : Double.MAX_VALUE))
                    .limit(TOP_N)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.warn("Failed to fetch unregistered NGOs: {}", e.getMessage());
        }

        // Build response
        return NearbyOrganizationsResponse.builder()
                .registeredNgos(top5RegisteredNgos)
                .unregisteredNgos(top5UnregisteredNgos)
                .notifiedCount(notifiedCount)
                .build();
    }

    /**
     * Send SMS to registered NGOs (top 5)
     */
    private int notifyRegisteredNgos(
            List<NgoWithContactResponse> ngos,
            FoodListing foodListing,
            Restaurant restaurant
    ) {
        if (ngos.isEmpty()) return 0;

        // Calculate urgency
        long hoursUntilExpiry = ChronoUnit.HOURS.between(
                LocalDateTime.now(),
                foodListing.getExpiryTime()
        );

        String urgency = "";
        if (hoursUntilExpiry <= 2) {
            urgency = "URGENT";
        } else if (hoursUntilExpiry <= 4) {
            urgency = "HIGH PRIORITY";
        }

        // Build SMS message
        String smsMessage = buildFoodAvailableSms(
                restaurant.getOrganizationName(),
                foodListing.getFoodName(),
                foodListing.getQuantity(),
                foodListing.getCategory().getDisplayName(),
                hoursUntilExpiry,
                urgency
        );

        // Collect valid phone numbers from top 5
        List<String> phoneNumbers = ngos.stream()
                .map(NgoWithContactResponse::getPhone)
                .filter(phone -> phone != null && !phone.isEmpty())
                .filter(smsService::isValidIndianMobile)
                .collect(Collectors.toList());

        // Send SMS in bulk
        if (!phoneNumbers.isEmpty()) {
            boolean smsSent = smsService.sendSms(phoneNumbers, smsMessage);
            if (smsSent) {
                logger.info("SMS sent to {} NGOs (top 5)", phoneNumbers.size());
                return phoneNumbers.size();
            }
        }

        return 0;
    }

    /**
     * Build NgoWithContactResponse from Ngo entity
     */
    private NgoWithContactResponse buildNgoWithContact(Ngo ngo, double distance) {
        if (ngo == null) {
            logger.warn("Attempted to build NgoWithContactResponse from null NGO");
            return null;
        }
        
        String phone = null;
        String email = null;
        try {
            if (ngo.getUser() != null) {
                phone = ngo.getUser().getPhone();
                email = ngo.getUser().getEmail();
            }
        } catch (Exception e) {
            logger.warn("Failed to get user info for NGO {}: {}", ngo.getNgoId(), e.getMessage());
        }
        
        return NgoWithContactResponse.builder()
                .ngoId(ngo.getNgoId())
                .organizationName(ngo.getOrganizationName() != null ? ngo.getOrganizationName() : "Unknown")
                .phone(phone)
                .email(email)
                .address(ngo.getAddress() != null ? ngo.getAddress() : "")
                .distanceKm(Math.round(distance * 10.0) / 10.0) // Round to 1 decimal
                .beneficiariesCount(ngo.getBeneficiariesCount() != null ? ngo.getBeneficiariesCount() : 0)
                .dietaryRequirements(ngo.getDietaryRequirements())
                .isRegistered(true)
                .build();
    }

    /**
     * Get top 5 registered + top 5 unregistered Restaurants near NGO
     * Send SMS/Email to top 5 registered restaurants
     */
    public NearbyRestaurantsResponse getAndNotifyNearbyRestaurants(
            Ngo ngo,
            int quantityNeeded,
            String foodPreference
    ) {
        // Find all nearby registered restaurants
        List<Restaurant> nearbyRestaurants = findNearbyRestaurants(
                ngo.getLatitude().doubleValue(),
                ngo.getLongitude().doubleValue(),
                10.0
        );

        // Sort by distance and get top 5 with contact info
        List<RestaurantWithContactResponse> top5RegisteredRestaurants = nearbyRestaurants.stream()
                .map(restaurant -> {
                    double distance = matchingAlgorithmService.calculateDistance(
                            ngo.getLatitude().doubleValue(),
                            ngo.getLongitude().doubleValue(),
                            restaurant.getLatitude().doubleValue(),
                            restaurant.getLongitude().doubleValue()
                    );
                    return buildRestaurantWithContact(restaurant, distance);
                })
                .filter(restaurant -> restaurant != null) // Filter out null responses
                .sorted(Comparator.comparing(RestaurantWithContactResponse::getDistanceKm))
                .limit(TOP_N)
                .collect(Collectors.toList());

        // Send notification to top 5 registered restaurants
        int notifiedCount = 0;
        if (!top5RegisteredRestaurants.isEmpty()) {
            notifiedCount = notifyRegisteredRestaurants(
                    top5RegisteredRestaurants,
                    ngo,
                    quantityNeeded,
                    foodPreference
            );
        }

        // Find top 5 unregistered restaurants from Google Places
        List<NearbyRestaurantResponse> top5UnregisteredRestaurants = new ArrayList<>();
        try {
            List<NearbyRestaurantResponse> googleRestaurants = googlePlacesService.findNearbyRestaurants(
                    ngo.getLatitude().doubleValue(),
                    ngo.getLongitude().doubleValue(),
                    10.0
            );

            // Remove duplicates
            Set<String> registeredNames = nearbyRestaurants.stream()
                    .map(r -> r.getOrganizationName().toLowerCase().trim())
                    .collect(Collectors.toSet());

            top5UnregisteredRestaurants = googleRestaurants.stream()
                    .filter(gr -> {
                        String name = gr.getName() != null ? gr.getName().toLowerCase().trim() : "";
                        return name.isEmpty() || !registeredNames.contains(name);
                    })
                    .sorted(Comparator.comparing(r -> r.getDistanceKm() != null ? r.getDistanceKm() : Double.MAX_VALUE))
                    .limit(TOP_N)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.warn("Failed to fetch unregistered restaurants: {}", e.getMessage());
        }

        // Build response
        return NearbyRestaurantsResponse.builder()
                .registeredRestaurants(top5RegisteredRestaurants)
                .unregisteredRestaurants(top5UnregisteredRestaurants)
                .notifiedCount(notifiedCount)
                .build();
    }

    /**
     * Send SMS to registered restaurants (top 5)
     */
    private int notifyRegisteredRestaurants(
            List<RestaurantWithContactResponse> restaurants,
            Ngo ngo,
            int quantityNeeded,
            String foodPreference
    ) {
        if (restaurants.isEmpty()) return 0;

        // Build SMS message
        String message = String.format(
                "🤝 %s needs %d servings of %s food. Help feed %d beneficiaries. Login to %s to donate.",
                ngo.getOrganizationName(),
                quantityNeeded,
                foodPreference.toLowerCase(),
                ngo.getBeneficiariesCount(),
                appName
        );

        // Collect phone numbers from top 5
        List<String> phoneNumbers = restaurants.stream()
                .map(RestaurantWithContactResponse::getPhone)
                .filter(phone -> phone != null && !phone.isEmpty())
                .filter(smsService::isValidIndianMobile)
                .collect(Collectors.toList());

        // Send SMS
        if (!phoneNumbers.isEmpty()) {
            boolean sent = smsService.sendSms(phoneNumbers, message);
            if (sent) {
                logger.info("SMS sent to {} restaurants (top 5)", phoneNumbers.size());
                return phoneNumbers.size();
            }
        }

        return 0;
    }

    /**
     * Build RestaurantWithContactResponse from Restaurant entity
     */
    private RestaurantWithContactResponse buildRestaurantWithContact(Restaurant restaurant, double distance) {
        if (restaurant == null) {
            logger.warn("Attempted to build RestaurantWithContactResponse from null Restaurant");
            return null;
        }
        
        String phone = null;
        String email = null;
        try {
            if (restaurant.getUser() != null) {
                phone = restaurant.getUser().getPhone();
                email = restaurant.getUser().getEmail();
            }
        } catch (Exception e) {
            logger.warn("Failed to get user info for Restaurant {}: {}", restaurant.getRestaurantId(), e.getMessage());
        }
        
        return RestaurantWithContactResponse.builder()
                .restaurantId(restaurant.getRestaurantId())
                .organizationName(restaurant.getOrganizationName() != null ? restaurant.getOrganizationName() : "Unknown")
                .phone(phone)
                .email(email)
                .address(restaurant.getAddress() != null ? restaurant.getAddress() : "")
                .distanceKm(Math.round(distance * 10.0) / 10.0) // Round to 1 decimal
                .cuisineType(restaurant.getCuisineType())
                .isRegistered(true)
                .build();
    }
}

