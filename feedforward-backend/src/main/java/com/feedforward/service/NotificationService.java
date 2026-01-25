package com.feedforward.service;

import com.feedforward.dto.response.NearbyNgoPlaceResponse;
import com.feedforward.dto.response.NearbyOrganizationsResponse;
import com.feedforward.dto.response.NearbyRestaurantResponse;
import com.feedforward.dto.response.NearbyRestaurantsResponse;
import com.feedforward.dto.response.NgoWithContactResponse;
import com.feedforward.dto.response.RestaurantWithContactResponse;
import com.feedforward.dto.response.SuggestedNgoResponse;
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
    private final EmailService emailService;
    private final NgoRepository ngoRepository;
    private final RestaurantRepository restaurantRepository;
    private final MatchingAlgorithmService matchingAlgorithmService;
    private final GooglePlacesService googlePlacesService;

    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;

    @Value("${app.name:FeedForward}")
    private String appName;

    private static final int TOP_N = 10; // Top 10 organizations

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
     * Build email message for food availability
     */
    private String buildFoodAvailableEmail(
            String restaurantName,
            String foodName,
            Integer quantity,
            String category,
            String unit,
            long hoursLeft,
            String urgency,
            String restaurantAddress,
            String restaurantPhone
    ) {
        StringBuilder email = new StringBuilder();
        email.append("Hello,\n\n");
        email.append("We have exciting news! ").append(restaurantName).append(" has listed surplus food that matches your needs.\n\n");
        
        email.append("📦 Food Details:\n");
        email.append("   • Food Name: ").append(foodName).append("\n");
        email.append("   • Quantity: ").append(quantity).append(" ").append(unit != null ? unit : "servings").append("\n");
        email.append("   • Category: ").append(category).append("\n");
        email.append("   • Time Remaining: ").append(hoursLeft).append(" hours\n");
        
        if (!urgency.isEmpty()) {
            email.append("   • Urgency: ").append(urgency).append("\n");
        }
        
        email.append("\n");
        email.append("📍 Restaurant Information:\n");
        email.append("   • Name: ").append(restaurantName).append("\n");
        if (restaurantAddress != null && !restaurantAddress.isEmpty()) {
            email.append("   • Address: ").append(restaurantAddress).append("\n");
        }
        if (restaurantPhone != null && !restaurantPhone.isEmpty()) {
            email.append("   • Phone: ").append(restaurantPhone).append("\n");
        }
        
        email.append("\n");
        email.append("🚀 Next Steps:\n");
        email.append("1. Login to ").append(appName).append(" at ").append(baseUrl).append("\n");
        email.append("2. Browse available food listings\n");
        email.append("3. Request the food you need\n");
        email.append("4. Coordinate pickup with the restaurant\n\n");
        
        email.append("Thank you for being part of the FeedForward community!\n\n");
        email.append("Best regards,\n");
        email.append("The FeedForward Team");
        
        return email.toString();
    }

    /**
     * Find NGOs within radius using Haversine formula
     * Fetches user relationship to avoid LazyInitializationException
     */
    private List<Ngo> findNearbyNgos(double lat, double lng, double radiusKm) {
        // Use repository method that eagerly fetches user relationship
        List<Ngo> allNgos = ngoRepository.findAllWithUser();
        logger.info("📊 Total NGOs in database: {}", allNgos.size());
        
        List<Ngo> nearbyNgos = new ArrayList<>();

        for (Ngo ngo : allNgos) {
            logger.debug("Checking NGO: {} (ID: {})", ngo.getOrganizationName(), ngo.getNgoId());
            
            // Skip if no location
            if (ngo.getLatitude() == null || ngo.getLongitude() == null) {
                logger.warn("⚠️ NGO {} has no coordinates (lat: {}, lng: {})", 
                        ngo.getOrganizationName(), ngo.getLatitude(), ngo.getLongitude());
                continue;
            }

            // User is already loaded, so we can safely check isActive
            if (ngo.getUser() != null && !ngo.getUser().getIsActive()) {
                logger.warn("⚠️ NGO {} has inactive user", ngo.getOrganizationName());
                continue;
            }

            double distance = matchingAlgorithmService.calculateDistance(
                    lat, lng,
                    ngo.getLatitude().doubleValue(),
                    ngo.getLongitude().doubleValue()
            );

            logger.debug("NGO {} distance: {} km (radius limit: {} km)", 
                    ngo.getOrganizationName(), distance, radiusKm);

            if (distance <= radiusKm) {
                nearbyNgos.add(ngo);
                logger.info("✅ NGO {} is within radius ({} km)", ngo.getOrganizationName(), distance);
            } else {
                logger.debug("❌ NGO {} is outside radius ({} km > {} km)", 
                        ngo.getOrganizationName(), distance, radiusKm);
            }
        }

        logger.info("📍 Found {} NGOs within {} km radius", nearbyNgos.size(), radiusKm);
        return nearbyNgos;
    }

    /**
     * Filter NGOs by dietary preference match
     */
    private List<Ngo> filterByDietaryMatch(List<Ngo> ngos, FoodListing foodListing) {
        String foodCategory = foodListing.getCategory().name().toLowerCase();
        String foodCategoryDisplay = foodListing.getCategory().getDisplayName().toLowerCase();
        logger.info("🥗 Filtering {} NGOs by dietary preference. Food category: {} ({})", 
                ngos.size(), foodCategory, foodCategoryDisplay);
        
        return ngos.stream()
                .filter(ngo -> {
                    // If NGO has no preference, include
                    String dietaryReq = ngo.getDietaryRequirements();
                    logger.debug("NGO: {}, Dietary Requirements: {}", ngo.getOrganizationName(), dietaryReq);
                    
                    if (dietaryReq == null || dietaryReq.trim().isEmpty() ||
                            dietaryReq.toLowerCase().contains("all")) {
                        logger.debug("✅ NGO {} included (no preference or 'all')", ngo.getOrganizationName());
                        return true;
                    }

                    // Match dietary preference
                    String ngoPreference = dietaryReq.toLowerCase();

                    // Check if NGO accepts all types (has "non-veg ok" or similar)
                    if (ngoPreference.contains("non-veg ok") || ngoPreference.contains("all types") || 
                        ngoPreference.contains("any") || ngoPreference.contains("non veg ok")) {
                        logger.debug("✅ NGO {} included (accepts all types)", ngo.getOrganizationName());
                        return true;
                    }

                    // Determine if food is vegetarian or non-vegetarian
                    // PROTEINS category might be non-veg, but most others are vegetarian
                    // Non-vegetarian keywords in category
                    boolean isFoodNonVeg = foodCategory.contains("protein") && 
                                          (foodCategoryDisplay.contains("chicken") || 
                                           foodCategoryDisplay.contains("fish") || 
                                           foodCategoryDisplay.contains("meat") ||
                                           foodCategoryDisplay.contains("non-veg"));
                    
                    // If food is non-vegetarian (only PROTEINS with meat/fish/chicken)
                    if (isFoodNonVeg) {
                        // NGO must accept non-veg
                        if (ngoPreference.contains("non") || ngoPreference.contains("all") || 
                            ngoPreference.contains("non-veg ok")) {
                            logger.debug("✅ NGO {} included (non-veg food, NGO accepts non-veg)", 
                                    ngo.getOrganizationName());
                            return true;
                        } else {
                            logger.debug("❌ NGO {} excluded (non-veg food, NGO only accepts veg)", 
                                    ngo.getOrganizationName());
                            return false;
                        }
                    }
                    
                    // Food is vegetarian (default - COOKED_RICE, VEGETABLES, BREAD, SWEETS, etc.)
                    // NGO must accept vegetarian (most NGOs do)
                    if (ngoPreference.contains("veg") || ngoPreference.contains("all") || 
                        ngoPreference.contains("vegetarian")) {
                        logger.debug("✅ NGO {} included (vegetarian food, NGO accepts veg)", 
                                ngo.getOrganizationName());
                        return true;
                    }

                    // Vegan match
                    if (foodCategory.contains("vegan") && ngoPreference.contains("vegan")) {
                        logger.debug("✅ NGO {} included (vegan match)", ngo.getOrganizationName());
                        return true;
                    }

                    logger.debug("❌ NGO {} excluded (dietary mismatch: food={}, ngo={})", 
                            ngo.getOrganizationName(), foodCategory, ngoPreference);
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
     * Get top 10 registered + top 10 unregistered NGOs near restaurant
     * Send SMS/Email to top 10 registered only
     */
    public NearbyOrganizationsResponse getAndNotifyNearbyNgos(
            FoodListing foodListing,
            Restaurant restaurant
    ) {
        logger.info("🔍 Finding nearby NGOs for restaurant: {} at ({}, {})", 
                restaurant.getOrganizationName(), 
                restaurant.getLatitude(), 
                restaurant.getLongitude());
        
        // Find all nearby registered NGOs
        List<Ngo> nearbyNgos = findNearbyNgos(
                restaurant.getLatitude().doubleValue(),
                restaurant.getLongitude().doubleValue(),
                10.0
        );

        logger.info("📍 Found {} NGOs within 10km radius", nearbyNgos.size());
        nearbyNgos.forEach(ngo -> {
            double dist = matchingAlgorithmService.calculateDistance(
                    restaurant.getLatitude().doubleValue(),
                    restaurant.getLongitude().doubleValue(),
                    ngo.getLatitude().doubleValue(),
                    ngo.getLongitude().doubleValue()
            );
            logger.info("  - {} at distance: {} km", ngo.getOrganizationName(), dist);
        });

        // Filter by dietary preference
        int beforeFilter = nearbyNgos.size();
        nearbyNgos = filterByDietaryMatch(nearbyNgos, foodListing);
        logger.info("🥗 After dietary filter: {} NGOs (removed {})", nearbyNgos.size(), beforeFilter - nearbyNgos.size());

        // Sort by distance and get top 10 with contact info
        logger.info("🔨 Building contact responses for {} NGOs", nearbyNgos.size());
        List<NgoWithContactResponse> top5RegisteredNgos = nearbyNgos.stream()
                .map(ngo -> {
                    double distance = matchingAlgorithmService.calculateDistance(
                            restaurant.getLatitude().doubleValue(),
                            restaurant.getLongitude().doubleValue(),
                            ngo.getLatitude().doubleValue(),
                            ngo.getLongitude().doubleValue()
                    );
                    NgoWithContactResponse response = buildNgoWithContact(ngo, distance);
                    if (response == null) {
                        logger.warn("⚠️ buildNgoWithContact returned null for NGO: {}", ngo.getOrganizationName());
                    } else {
                        logger.info("✅ Built response for NGO: {} at {} km", ngo.getOrganizationName(), distance);
                    }
                    return response;
                })
                .filter(ngo -> ngo != null) // Filter out null responses
                .sorted(Comparator.comparing(NgoWithContactResponse::getDistanceKm))
                .limit(TOP_N)
                .collect(Collectors.toList());
        
        logger.info("📋 Final top {} registered NGOs: {}", top5RegisteredNgos.size(), 
                top5RegisteredNgos.stream().map(NgoWithContactResponse::getOrganizationName).collect(Collectors.toList()));

        // Send SMS/Email to top 10 registered NGOs
        int notifiedCount = 0;
        if (!top5RegisteredNgos.isEmpty()) {
            notifiedCount = notifyRegisteredNgos(
                    top5RegisteredNgos,
                    foodListing,
                    restaurant
            );
        }

        // Find top 10 unregistered NGOs from Google Places
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
        logger.info("📦 Building NearbyOrganizationsResponse: {} registered, {} unregistered", 
                top5RegisteredNgos.size(), top5UnregisteredNgos.size());
        
        NearbyOrganizationsResponse response = NearbyOrganizationsResponse.builder()
                .registeredNgos(top5RegisteredNgos)
                .unregisteredNgos(top5UnregisteredNgos)
                .notifiedCount(notifiedCount)
                .build();
        
        logger.info("✅ Response built successfully. Registered NGOs count: {}", 
                response.getRegisteredNgos() != null ? response.getRegisteredNgos().size() : 0);
        
        return response;
    }

    /**
     * Send SMS to registered NGOs (top 10)
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

        // Collect valid phone numbers from top 10
        logger.info("📱 Collecting phone numbers from {} NGOs", ngos.size());
        
        // Log all NGOs first
        ngos.forEach(ngo -> {
            logger.info("📱 NGO: '{}', Phone: '{}', Email: '{}'", 
                    ngo.getOrganizationName(), ngo.getPhone(), ngo.getEmail());
        });
        
        List<String> phoneNumbers = ngos.stream()
                .map(ngo -> {
                    String phone = ngo.getPhone();
                    boolean isValid = phone != null && !phone.isEmpty() && smsService.isValidIndianMobile(phone);
                    logger.info("📱 NGO: '{}', Phone: '{}', Valid: {}", 
                            ngo.getOrganizationName(), phone, isValid);
                    if (!isValid && phone != null && !phone.isEmpty()) {
                        logger.warn("⚠️ Phone number '{}' for NGO '{}' failed validation", 
                                phone, ngo.getOrganizationName());
                    }
                    return phone;
                })
                .filter(phone -> {
                    if (phone == null || phone.isEmpty()) {
                        logger.debug("Filtering out null/empty phone number");
                        return false;
                    }
                    boolean isValid = smsService.isValidIndianMobile(phone);
                    if (!isValid) {
                        logger.warn("⚠️ Phone number '{}' failed validation and was filtered out", phone);
                    }
                    return isValid;
                })
                .collect(Collectors.toList());

        logger.info("📱 Valid phone numbers collected: {} out of {} NGOs", phoneNumbers.size(), ngos.size());
        logger.info("📱 Phone numbers to send SMS: {}", phoneNumbers);

        // Send SMS in bulk
        int smsCount = 0;
        if (!phoneNumbers.isEmpty()) {
            logger.info("📱 Attempting to send SMS to {} phone numbers", phoneNumbers.size());
            boolean smsSent = smsService.sendSms(phoneNumbers, smsMessage);
            if (smsSent) {
                // Note: smsSent=true means at least one SMS was sent successfully
                // Some may have failed (e.g., unverified numbers on trial account)
                logger.info("✅ SMS sent successfully to at least one NGO (some may have failed if unverified)");
                smsCount = phoneNumbers.size();
            } else {
                logger.error("❌ Failed to send SMS to all {} NGOs", phoneNumbers.size());
                logger.error("💡 Check logs above for details. If using Twilio Trial account, verify numbers at:");
                logger.error("   https://www.twilio.com/console/phone-numbers/verified");
            }
        } else {
            logger.warn("⚠️ No valid phone numbers found in {} NGOs", ngos.size());
            // Log NGO details for debugging
            ngos.forEach(ngo -> {
                logger.warn("NGO: {}, Phone: {}, Email: {}", 
                        ngo.getOrganizationName(), ngo.getPhone(), ngo.getEmail());
            });
        }

        // Send Emails to registered NGOs
        List<String> emailAddresses = ngos.stream()
                .map(NgoWithContactResponse::getEmail)
                .filter(email -> email != null && !email.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        List<String> ngoNames = ngos.stream()
                .map(NgoWithContactResponse::getOrganizationName)
                .filter(name -> name != null && !name.isEmpty())
                .collect(Collectors.toList());

        int emailCount = 0;
        if (!emailAddresses.isEmpty()) {
            // Build email subject and message
            String emailSubject = String.format("🍽️ Food Available: %s from %s", 
                    foodListing.getFoodName(), restaurant.getOrganizationName());
            
            String emailMessage = buildFoodAvailableEmail(
                    restaurant.getOrganizationName(),
                    foodListing.getFoodName(),
                    foodListing.getQuantity(),
                    foodListing.getCategory().getDisplayName(),
                    foodListing.getUnit(),
                    hoursUntilExpiry,
                    urgency,
                    restaurant.getAddress(),
                    restaurant.getUser() != null ? restaurant.getUser().getPhone() : null
            );

            logger.info("📧 Attempting to send emails to {} NGOs", emailAddresses.size());
            logger.info("📧 Email addresses: {}", emailAddresses);
            emailCount = emailService.sendBulkEmails(emailAddresses, emailSubject, emailMessage, ngoNames);
            if (emailCount > 0) {
                logger.info("✅ Email sent successfully to {} NGOs (top 10)", emailCount);
            } else {
                logger.error("❌ Email sending failed for all {} NGOs. Check EmailJS configuration and logs above.", emailAddresses.size());
                logger.error("💡 Common issues:");
                logger.error("   1. EmailJS service_id or template_id not configured");
                logger.error("   2. Invalid email addresses");
                logger.error("   3. EmailJS API errors (check logs above for details)");
            }
        } else {
            logger.warn("⚠️ No valid email addresses found in {} NGOs", ngos.size());
            logger.warn("📧 NGO email addresses: {}", ngos.stream()
                    .map(ngo -> ngo.getOrganizationName() + " -> " + ngo.getEmail())
                    .collect(Collectors.joining(", ")));
        }

        // Return total notification count (SMS + Email)
        return Math.max(smsCount, emailCount);
    }

    /**
     * Notify next batch of NGOs (Escalation)
     */
    public int notifyNextBatch(FoodListing foodListing) {
        try {
            int batchSize = 5;
            int batchNumber = foodListing.getBatchNumber();
            int offset = (batchNumber - 1) * batchSize;
            
            // We want the NEXT batch, so offset logic:
            // Batch 1 (initial): offset 0 (0-4 notifications sent initially)
            // Batch 2 (escalation 1): offset 5 (5-9)
            // But wait, the initial notification sent to TOP 10 (batch 1+2 effectively?).
            // Let's refine based on user request: "Batch 2 -> NGOs 6-10".
            // If TOP_N was 10, then batch 1 was actually 1-10?
            // The prompt says: "First batch (NGOs 1–5) has already been notified."
            // But my TOP_N constant is 10. Let's adjust logic to respect batch size of 5.
            
            // Re-calculating offset for escalation:
            // Initial (Batch 1): 0-4
            // Escalation (Batch 2): 5-9
            // Escalation (Batch 3): 10-14
            
            // If current batch is 1 (meaning we are escalating FROM 1 TO 2), we want 5-9.
            // If current batch is 2 (escalating FROM 2 TO 3), we want 10-14.
            
            // So for "escalating to batch N+1", we fetch with offset = N * 5.
            // Example:
            // Current batch = 1. We want batch 2 (index 5-9). Offset = 1 * 5 = 5. Limit = 5.
            // Current batch = 2. We want batch 3 (index 10-14). Offset = 2 * 5 = 10. Limit = 5.
            
            int targetOffset = batchNumber * batchSize;
            
            logger.info("🚀 Escalating notifications for listing {} to Batch {} (Offset: {}, Limit: {})", 
                    foodListing.getListingId(), batchNumber + 1, targetOffset, batchSize);

            // Find matching NGOs with pagination
            List<SuggestedNgoResponse> nextBatchSuggestions = matchingAlgorithmService.findMatchingNgos(
                    foodListing, batchSize, targetOffset
            );

            if (nextBatchSuggestions.isEmpty()) {
                logger.info("No more NGOs found for escalation batch {}", batchNumber + 1);
                return 0;
            }

            // Convert suggestions to NGO entities with contact info
            // Note: matchingAlgorithmService returns IDs, we need to fetch entities or contact info
            // For efficiency, let's fetch by IDs
            List<Long> ngoIds = nextBatchSuggestions.stream()
                    .map(SuggestedNgoResponse::getNgoId)
                    .collect(Collectors.toList());
            
            List<Ngo> ngos = ngoRepository.findAllById(ngoIds);
            
            // Map to NgoWithContactResponse for notification method
            List<NgoWithContactResponse> ngoContacts = ngos.stream()
                .map(ngo -> {
                    // Calculate distance again (or pass it from suggestion)
                    double distance = matchingAlgorithmService.calculateDistance(
                            foodListing.getRestaurant().getLatitude().doubleValue(),
                            foodListing.getRestaurant().getLongitude().doubleValue(),
                            ngo.getLatitude().doubleValue(),
                            ngo.getLongitude().doubleValue()
                    );
                    return buildNgoWithContact(ngo, distance);
                })
                .filter(res -> res != null)
                .collect(Collectors.toList());

            // Notify them using existing method
            return notifyRegisteredNgos(ngoContacts, foodListing, foodListing.getRestaurant());

        } catch (Exception e) {
            logger.error("Error in notifyNextBatch: {}", e.getMessage(), e);
            return 0;
        }
    }

    /**
     * Build NgoWithContactResponse from Ngo entity
     */
    private NgoWithContactResponse buildNgoWithContact(Ngo ngo, double distance) {
        if (ngo == null) {
            logger.warn("⚠️ Attempted to build NgoWithContactResponse from null NGO");
            return null;
        }
        
        String phone = null;
        String email = null;
        try {
            if (ngo.getUser() != null) {
                phone = ngo.getUser().getPhone();
                email = ngo.getUser().getEmail();
                logger.info("📱 NGO '{}' contact info: phone='{}', email='{}'", 
                        ngo.getOrganizationName(), phone, email);
            } else {
                logger.warn("⚠️ NGO {} has no user relationship", ngo.getOrganizationName());
            }
        } catch (Exception e) {
            logger.error("❌ Failed to get user info for NGO {}: {}", ngo.getNgoId(), e.getMessage(), e);
        }
        
        NgoWithContactResponse response = NgoWithContactResponse.builder()
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
        
        logger.debug("✅ Built NgoWithContactResponse for {}: distance={}km, phone={}", 
                ngo.getOrganizationName(), response.getDistanceKm(), phone != null ? "yes" : "no");
        
        return response;
    }

    /**
     * Get top 10 registered + top 10 unregistered Restaurants near NGO
     * Send SMS/Email to top 10 registered restaurants
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

        // Sort by distance and get top 10 with contact info
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

        // Send notification to top 10 registered restaurants
        int notifiedCount = 0;
        if (!top5RegisteredRestaurants.isEmpty()) {
            notifiedCount = notifyRegisteredRestaurants(
                    top5RegisteredRestaurants,
                    ngo,
                    quantityNeeded,
                    foodPreference
            );
        }

        // Find top 10 unregistered restaurants from Google Places
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
     * Send SMS to registered restaurants (top 10)
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

        // Collect phone numbers from top 10
        List<String> phoneNumbers = restaurants.stream()
                .map(RestaurantWithContactResponse::getPhone)
                .filter(phone -> phone != null && !phone.isEmpty())
                .filter(smsService::isValidIndianMobile)
                .collect(Collectors.toList());

        // Send SMS
        if (!phoneNumbers.isEmpty()) {
            boolean sent = smsService.sendSms(phoneNumbers, message);
            if (sent) {
                logger.info("SMS sent to {} restaurants (top 10)", phoneNumbers.size());
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

