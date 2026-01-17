package com.feedforward.repository;

import com.feedforward.entity.DonationHistory;
import com.feedforward.enums.FoodCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DonationHistoryRepository extends JpaRepository<DonationHistory, Long> {

    // Find all donations by restaurant
    @Query("SELECT dh FROM DonationHistory dh " +
            "WHERE dh.restaurant.restaurantId = :restaurantId " +
            "ORDER BY dh.donatedAt DESC")
    List<DonationHistory> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    // Find all donations by NGO
    @Query("SELECT dh FROM DonationHistory dh " +
            "WHERE dh.ngo.ngoId = :ngoId " +
            "ORDER BY dh.donatedAt DESC")
    List<DonationHistory> findByNgoId(@Param("ngoId") Long ngoId);

    // Find donations by date range
    @Query("SELECT dh FROM DonationHistory dh " +
            "WHERE dh.donatedAt BETWEEN :startDate AND :endDate " +
            "ORDER BY dh.donatedAt DESC")
    List<DonationHistory> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Find donations by restaurant and date range
    @Query("SELECT dh FROM DonationHistory dh " +
            "WHERE dh.restaurant.restaurantId = :restaurantId " +
            "AND dh.donatedAt BETWEEN :startDate AND :endDate " +
            "ORDER BY dh.donatedAt DESC")
    List<DonationHistory> findByRestaurantAndDateRange(
            @Param("restaurantId") Long restaurantId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Find donations by NGO and date range
    @Query("SELECT dh FROM DonationHistory dh " +
            "WHERE dh.ngo.ngoId = :ngoId " +
            "AND dh.donatedAt BETWEEN :startDate AND :endDate " +
            "ORDER BY dh.donatedAt DESC")
    List<DonationHistory> findByNgoAndDateRange(
            @Param("ngoId") Long ngoId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Get total donations count
    @Query("SELECT COUNT(dh) FROM DonationHistory dh")
    long getTotalDonationsCount();

    // Get total servings donated
    @Query("SELECT COALESCE(SUM(dh.quantityDonated), 0) FROM DonationHistory dh")
    Long getTotalServingsDonated();

    // Get total servings donated today
    @Query("SELECT COALESCE(SUM(dh.quantityDonated), 0) FROM DonationHistory dh " +
            "WHERE DATE(dh.donatedAt) = CURRENT_DATE")
    Long getTodayServingsDonated();

    // Get category-wise distribution
    @Query("SELECT dh.category, COUNT(dh), SUM(dh.quantityDonated) " +
            "FROM DonationHistory dh " +
            "GROUP BY dh.category " +
            "ORDER BY SUM(dh.quantityDonated) DESC")
    List<Object[]> getCategoryWiseDistribution();

    // Get monthly statistics
    @Query("SELECT " +
            "FUNCTION('YEAR', dh.donatedAt) as year, " +
            "FUNCTION('MONTH', dh.donatedAt) as month, " +
            "COUNT(dh) as donationCount, " +
            "SUM(dh.quantityDonated) as totalServings " +
            "FROM DonationHistory dh " +
            "WHERE dh.donatedAt >= :startDate " +
            "GROUP BY FUNCTION('YEAR', dh.donatedAt), FUNCTION('MONTH', dh.donatedAt) " +
            "ORDER BY year DESC, month DESC")
    List<Object[]> getMonthlyStatistics(@Param("startDate") LocalDateTime startDate);

    // Get impact statistics for restaurant
    @Query("SELECT " +
            "COUNT(dh) as totalDonations, " +
            "SUM(dh.quantityDonated) as totalServings, " +
            "AVG(dh.ngoRating) as averageRating " +
            "FROM DonationHistory dh " +
            "WHERE dh.restaurant.restaurantId = :restaurantId")
    Object[] getRestaurantImpactStats(@Param("restaurantId") Long restaurantId);

    // Get impact statistics for NGO
    @Query("SELECT " +
            "COUNT(dh) as totalReceived, " +
            "SUM(dh.quantityDonated) as totalServings, " +
            "AVG(dh.restaurantRating) as averageRating " +
            "FROM DonationHistory dh " +
            "WHERE dh.ngo.ngoId = :ngoId")
    Object[] getNgoImpactStats(@Param("ngoId") Long ngoId);

    // Find recent donations (last 10)
    @Query("SELECT dh FROM DonationHistory dh " +
            "ORDER BY dh.donatedAt DESC")
    List<DonationHistory> findRecentDonations(org.springframework.data.domain.Pageable pageable);

    // Get donations between restaurant and NGO
    @Query("SELECT dh FROM DonationHistory dh " +
            "WHERE dh.restaurant.restaurantId = :restaurantId " +
            "AND dh.ngo.ngoId = :ngoId " +
            "ORDER BY dh.donatedAt DESC")
    List<DonationHistory> findDonationsBetweenRestaurantAndNgo(
            @Param("restaurantId") Long restaurantId,
            @Param("ngoId") Long ngoId);

    // Count donations by category
    long countByCategory(FoodCategory category);
}


