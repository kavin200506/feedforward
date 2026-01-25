package com.feedforward.repository;

import com.feedforward.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    // Find restaurant by user ID
    Optional<Restaurant> findByUser_UserId(Long userId);

    // Find restaurant with user details
    @Query("SELECT r FROM Restaurant r JOIN FETCH r.user WHERE r.restaurantId = :id")
    Optional<Restaurant> findByIdWithUser(@Param("id") Long id);

    // Find restaurants within radius using Haversine formula
    @Query(value = "SELECT r.*, " +
            "(6371 * acos(cos(radians(:latitude)) * cos(radians(r.latitude)) * " +
            "cos(radians(r.longitude) - radians(:longitude)) + " +
            "sin(radians(:latitude)) * sin(radians(r.latitude)))) AS distance " +
            "FROM restaurants r " +
            "WHERE r.user_id IN (SELECT user_id FROM users WHERE is_active = true) " +
            "HAVING distance <= :radiusKm " +
            "ORDER BY distance ASC",
            nativeQuery = true)
    List<Restaurant> findRestaurantsWithinRadius(
            @Param("latitude") BigDecimal latitude,
            @Param("longitude") BigDecimal longitude,
            @Param("radiusKm") double radiusKm);

    // Get top restaurants by total donations
    @Query("SELECT r FROM Restaurant r WHERE r.user.isActive = true " +
            "ORDER BY r.totalServingsDonated DESC")
    List<Restaurant> findTopDonors(org.springframework.data.domain.Pageable pageable);

    // Get restaurants with highest ratings
    @Query("SELECT r FROM Restaurant r WHERE r.user.isActive = true AND r.rating > 0 " +
            "ORDER BY r.rating DESC, r.totalDonations DESC")
    List<Restaurant> findTopRatedRestaurants(org.springframework.data.domain.Pageable pageable);

    // Search restaurants by name or cuisine
    @Query("SELECT r FROM Restaurant r WHERE r.user.isActive = true AND " +
            "(LOWER(r.organizationName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.cuisineType) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Restaurant> searchRestaurants(@Param("keyword") String keyword);

    // Count total active restaurants
    @Query("SELECT COUNT(r) FROM Restaurant r WHERE r.user.isActive = true")
    long countActiveRestaurants();

    // Get total servings donated across all restaurants
    @Query("SELECT COALESCE(SUM(r.totalServingsDonated), 0) FROM Restaurant r " +
            "WHERE r.user.isActive = true")
    Long getTotalServingsDonated();

    // Get restaurants with active listings
    @Query("SELECT DISTINCT r FROM Restaurant r JOIN r.foodListings fl " +
            "WHERE r.user.isActive = true AND fl.status = 'AVAILABLE' " +
            "AND fl.expiryTime > CURRENT_TIMESTAMP")
    List<Restaurant> findRestaurantsWithActiveListings();

    // Find all restaurants with user relationship loaded (for notifications)
    @Query("SELECT r FROM Restaurant r JOIN FETCH r.user WHERE r.user.isActive = true")
    List<Restaurant> findAllWithUser();
}


