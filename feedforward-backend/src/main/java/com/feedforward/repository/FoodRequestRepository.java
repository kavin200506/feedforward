package com.feedforward.repository;

import com.feedforward.entity.FoodRequest;
import com.feedforward.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FoodRequestRepository extends JpaRepository<FoodRequest, Long> {

    // Find request with full details (listing, restaurant, NGO)
    @Query("SELECT fr FROM FoodRequest fr " +
            "JOIN FETCH fr.foodListing fl " +
            "JOIN FETCH fl.restaurant r " +
            "JOIN FETCH r.user ru " +
            "JOIN FETCH fr.ngo n " +
            "JOIN FETCH n.user nu " +
            "WHERE fr.requestId = :id")
    Optional<FoodRequest> findByIdWithDetails(@Param("id") Long id);

    // Find all requests by NGO
    @Query("SELECT fr FROM FoodRequest fr JOIN FETCH fr.foodListing fl " +
            "WHERE fr.ngo.ngoId = :ngoId ORDER BY fr.createdAt DESC")
    List<FoodRequest> findByNgoId(@Param("ngoId") Long ngoId);

    // Find active requests by NGO
    @Query("SELECT fr FROM FoodRequest fr JOIN FETCH fr.foodListing fl " +
            "WHERE fr.ngo.ngoId = :ngoId " +
            "AND fr.status IN ('PENDING', 'APPROVED', 'PICKED_UP') " +
            "ORDER BY fr.createdAt DESC")
    List<FoodRequest> findActiveRequestsByNgoId(@Param("ngoId") Long ngoId);

    // Find completed requests by NGO
    @Query("SELECT fr FROM FoodRequest fr JOIN FETCH fr.foodListing fl " +
            "WHERE fr.ngo.ngoId = :ngoId " +
            "AND fr.status = 'COMPLETED' " +
            "ORDER BY fr.completedAt DESC")
    List<FoodRequest> findCompletedRequestsByNgoId(@Param("ngoId") Long ngoId);

    // Find pending requests for restaurant
    @Query("SELECT fr FROM FoodRequest fr " +
            "JOIN FETCH fr.foodListing fl " +
            "JOIN FETCH fr.ngo n " +
            "WHERE fl.restaurant.restaurantId = :restaurantId " +
            "AND fr.status = 'PENDING' " +
            "ORDER BY fr.createdAt ASC")
    List<FoodRequest> findPendingRequestsByRestaurantId(@Param("restaurantId") Long restaurantId);

    // Find all requests for restaurant
    @Query("SELECT fr FROM FoodRequest fr " +
            "JOIN FETCH fr.foodListing fl " +
            "JOIN FETCH fr.ngo n " +
            "WHERE fl.restaurant.restaurantId = :restaurantId " +
            "ORDER BY fr.createdAt DESC")
    List<FoodRequest> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    // Find requests by listing ID
    List<FoodRequest> findByFoodListing_ListingId(Long listingId);

    // Find requests by status
    List<FoodRequest> findByStatus(RequestStatus status);

    // Count pending requests by restaurant
    @Query("SELECT COUNT(fr) FROM FoodRequest fr " +
            "WHERE fr.foodListing.restaurant.restaurantId = :restaurantId " +
            "AND fr.status = 'PENDING'")
    long countPendingRequestsByRestaurant(@Param("restaurantId") Long restaurantId);

    // Count active requests by NGO
    @Query("SELECT COUNT(fr) FROM FoodRequest fr " +
            "WHERE fr.ngo.ngoId = :ngoId " +
            "AND fr.status IN ('PENDING', 'APPROVED', 'PICKED_UP')")
    long countActiveRequestsByNgo(@Param("ngoId") Long ngoId);

    // Find requests by date range
    @Query("SELECT fr FROM FoodRequest fr " +
            "WHERE fr.createdAt BETWEEN :startDate AND :endDate " +
            "ORDER BY fr.createdAt DESC")
    List<FoodRequest> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Check if NGO has already requested this listing
    @Query("SELECT COUNT(fr) > 0 FROM FoodRequest fr " +
            "WHERE fr.foodListing.listingId = :listingId " +
            "AND fr.ngo.ngoId = :ngoId " +
            "AND fr.status NOT IN ('REJECTED', 'CANCELLED')")
    boolean hasNgoRequestedListing(
            @Param("listingId") Long listingId,
            @Param("ngoId") Long ngoId);

    // Find approved requests with expired pickup time
    @Query("SELECT fr FROM FoodRequest fr " +
            "WHERE fr.status = 'APPROVED' " +
            "AND fr.pickupTime < :currentTime")
    List<FoodRequest> findExpiredPickups(@Param("currentTime") LocalDateTime currentTime);

    // Get request statistics by NGO
    @Query("SELECT " +
            "COUNT(fr) as totalRequests, " +
            "SUM(CASE WHEN fr.status = 'APPROVED' THEN 1 ELSE 0 END) as approvedRequests, " +
            "SUM(CASE WHEN fr.status = 'COMPLETED' THEN fr.quantityRequested ELSE 0 END) as totalReceived " +
            "FROM FoodRequest fr WHERE fr.ngo.ngoId = :ngoId")
    Object[] getNgoRequestStatistics(@Param("ngoId") Long ngoId);

    // Get request statistics by restaurant
    @Query("SELECT " +
            "COUNT(fr) as totalRequests, " +
            "SUM(CASE WHEN fr.status = 'APPROVED' THEN 1 ELSE 0 END) as approvedRequests, " +
            "SUM(CASE WHEN fr.status = 'COMPLETED' THEN fr.quantityRequested ELSE 0 END) as totalDonated " +
            "FROM FoodRequest fr WHERE fr.foodListing.restaurant.restaurantId = :restaurantId")
    Object[] getRestaurantRequestStatistics(@Param("restaurantId") Long restaurantId);
}


