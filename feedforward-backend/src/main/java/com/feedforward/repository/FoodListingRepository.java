package com.feedforward.repository;

import com.feedforward.entity.FoodListing;
import com.feedforward.enums.FoodCategory;
import com.feedforward.enums.ListingStatus;
import com.feedforward.enums.UrgencyLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FoodListingRepository extends JpaRepository<FoodListing, Long> {

    // Find listing with restaurant details
    @Query("SELECT fl FROM FoodListing fl JOIN FETCH fl.restaurant r JOIN FETCH r.user " +
            "WHERE fl.listingId = :id")
    Optional<FoodListing> findByIdWithRestaurant(@Param("id") Long id);

    // Find all available listings
    @Query("SELECT fl FROM FoodListing fl WHERE fl.status = 'AVAILABLE' " +
            "AND fl.expiryTime > CURRENT_TIMESTAMP")
    List<FoodListing> findAllAvailableListings();

    // Find available listings with pagination
    Page<FoodListing> findByStatusAndExpiryTimeAfter(
            ListingStatus status,
            LocalDateTime expiryTime,
            Pageable pageable);

    // Find listings by restaurant ID
    @Query("SELECT fl FROM FoodListing fl WHERE fl.restaurant.restaurantId = :restaurantId " +
            "ORDER BY fl.createdAt DESC")
    List<FoodListing> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    // Find active listings by restaurant ID
    @Query("SELECT fl FROM FoodListing fl WHERE fl.restaurant.restaurantId = :restaurantId " +
            "AND fl.status = 'AVAILABLE' AND fl.expiryTime > CURRENT_TIMESTAMP " +
            "ORDER BY fl.expiryTime ASC")
    List<FoodListing> findActiveListingsByRestaurantId(@Param("restaurantId") Long restaurantId);

    // Search available listings near location with filters
    @Query(value = "SELECT fl.*, " +
            "(6371 * acos(cos(radians(:latitude)) * cos(radians(r.latitude)) * " +
            "cos(radians(r.longitude) - radians(:longitude)) + " +
            "sin(radians(:latitude)) * sin(radians(r.latitude)))) AS distance " +
            "FROM food_listings fl " +
            "JOIN restaurants r ON fl.restaurant_id = r.restaurant_id " +
            "JOIN users u ON r.user_id = u.user_id " +
            "WHERE fl.status = 'AVAILABLE' " +
            "AND fl.expiry_time > NOW() " +
            "AND u.is_active = true " +
            "AND (:category IS NULL OR fl.category = :category) " +
            "AND (:urgencyLevel IS NULL OR fl.urgency_level = :urgencyLevel) " +
            "AND (:searchTerm IS NULL OR LOWER(fl.food_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "HAVING distance <= :radiusKm " +
            "ORDER BY " +
            "CASE WHEN :sortBy = 'expiry' THEN fl.expiry_time END ASC, " +
            "CASE WHEN :sortBy = 'distance' THEN distance END ASC, " +
            "CASE WHEN :sortBy = 'quantity' THEN fl.quantity END DESC",
            countQuery = "SELECT COUNT(*) FROM food_listings fl " +
                    "JOIN restaurants r ON fl.restaurant_id = r.restaurant_id " +
                    "WHERE fl.status = 'AVAILABLE' " +
                    "AND fl.expiry_time > NOW()",
            nativeQuery = true)
    List<FoodListing> searchNearbyListings(
            @Param("latitude") BigDecimal latitude,
            @Param("longitude") BigDecimal longitude,
            @Param("radiusKm") double radiusKm,
            @Param("category") String category,
            @Param("urgencyLevel") String urgencyLevel,
            @Param("searchTerm") String searchTerm,
            @Param("sortBy") String sortBy);

    // Find listings by category
    List<FoodListing> findByCategoryAndStatusAndExpiryTimeAfter(
            FoodCategory category,
            ListingStatus status,
            LocalDateTime expiryTime);

    // Find listings by urgency level
    List<FoodListing> findByUrgencyLevelAndStatusAndExpiryTimeAfter(
            UrgencyLevel urgencyLevel,
            ListingStatus status,
            LocalDateTime expiryTime);

    // Count active listings by restaurant
    @Query("SELECT COUNT(fl) FROM FoodListing fl WHERE fl.restaurant.restaurantId = :restaurantId " +
            "AND fl.status = 'AVAILABLE' AND fl.expiryTime > CURRENT_TIMESTAMP")
    long countActiveListingsByRestaurant(@Param("restaurantId") Long restaurantId);

    // Get total available servings
    @Query("SELECT COALESCE(SUM(fl.quantity), 0) FROM FoodListing fl " +
            "WHERE fl.status = 'AVAILABLE' AND fl.expiryTime > CURRENT_TIMESTAMP")
    Long getTotalAvailableServings();

    // Update expired listings status (Scheduled task)
    @Modifying
    @Transactional
    @Query("UPDATE FoodListing fl SET fl.status = 'EXPIRED' " +
            "WHERE fl.status = 'AVAILABLE' AND fl.expiryTime <= CURRENT_TIMESTAMP")
    int markExpiredListings();

    // Find urgent listings (expiring in next hour)
    @Query("SELECT fl FROM FoodListing fl WHERE fl.status = 'AVAILABLE' " +
            "AND fl.expiryTime > CURRENT_TIMESTAMP " +
            "AND fl.expiryTime <= :oneHourFromNow " +
            "ORDER BY fl.expiryTime ASC")
    List<FoodListing> findUrgentListings(@Param("oneHourFromNow") LocalDateTime oneHourFromNow);

    // Get statistics by restaurant
    @Query("SELECT " +
            "COUNT(fl) as totalListings, " +
            "SUM(CASE WHEN fl.status = 'COMPLETED' THEN fl.quantity ELSE 0 END) as donatedServings, " +
            "SUM(CASE WHEN fl.status = 'EXPIRED' THEN fl.quantity ELSE 0 END) as expiredServings " +
            "FROM FoodListing fl WHERE fl.restaurant.restaurantId = :restaurantId")
    Object[] getRestaurantStatistics(@Param("restaurantId") Long restaurantId);

    // Find listings with pending requests
    @Query("SELECT DISTINCT fl FROM FoodListing fl " +
            "JOIN fl.requests r WHERE fl.restaurant.restaurantId = :restaurantId " +
            "AND r.status = 'PENDING' " +
            "ORDER BY r.createdAt DESC")
    List<FoodListing> findListingsWithPendingRequests(@Param("restaurantId") Long restaurantId);

    // Get listings by date range
    @Query("SELECT fl FROM FoodListing fl WHERE fl.restaurant.restaurantId = :restaurantId " +
            "AND fl.createdAt BETWEEN :startDate AND :endDate " +
            "ORDER BY fl.createdAt DESC")
    List<FoodListing> findByRestaurantAndDateRange(
            @Param("restaurantId") Long restaurantId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Find listings by dietary requirements
    @Query("SELECT fl FROM FoodListing fl WHERE fl.status = 'AVAILABLE' " +
            "AND fl.expiryTime > CURRENT_TIMESTAMP " +
            "AND (fl.dietaryInfo IS NULL OR fl.dietaryInfo LIKE CONCAT('%', :dietaryRequirement, '%'))")
    List<FoodListing> findByDietaryRequirement(@Param("dietaryRequirement") String dietaryRequirement);
}


