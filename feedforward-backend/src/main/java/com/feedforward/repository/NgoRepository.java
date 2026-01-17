package com.feedforward.repository;

import com.feedforward.entity.Ngo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface NgoRepository extends JpaRepository<Ngo, Long> {

    // Find NGO by user ID
    Optional<Ngo> findByUser_UserId(Long userId);

    // Find NGO with user details
    @Query("SELECT n FROM Ngo n JOIN FETCH n.user WHERE n.ngoId = :id")
    Optional<Ngo> findByIdWithUser(@Param("id") Long id);

    // Find NGOs within radius using Haversine formula
    @Query(value = "SELECT n.*, " +
            "(6371 * acos(cos(radians(:latitude)) * cos(radians(n.latitude)) * " +
            "cos(radians(n.longitude) - radians(:longitude)) + " +
            "sin(radians(:latitude)) * sin(radians(n.latitude)))) AS distance " +
            "FROM ngos n " +
            "WHERE n.user_id IN (SELECT user_id FROM users WHERE is_active = true) " +
            "HAVING distance <= :radiusKm " +
            "ORDER BY distance ASC",
            nativeQuery = true)
    List<Ngo> findNgosWithinRadius(
            @Param("latitude") BigDecimal latitude,
            @Param("longitude") BigDecimal longitude,
            @Param("radiusKm") double radiusKm);

    // Get top NGOs by servings received
    @Query("SELECT n FROM Ngo n WHERE n.user.isActive = true " +
            "ORDER BY n.totalServingsReceived DESC")
    List<Ngo> findTopReceivers(org.springframework.data.domain.Pageable pageable);

    // Find NGOs by beneficiaries count range
    @Query("SELECT n FROM Ngo n WHERE n.user.isActive = true AND " +
            "n.beneficiariesCount >= :minBeneficiaries AND " +
            "n.beneficiariesCount <= :maxBeneficiaries")
    List<Ngo> findByBeneficiariesRange(
            @Param("minBeneficiaries") Integer minBeneficiaries,
            @Param("maxBeneficiaries") Integer maxBeneficiaries);

    // Search NGOs by name
    @Query("SELECT n FROM Ngo n WHERE n.user.isActive = true AND " +
            "LOWER(n.organizationName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Ngo> searchNgos(@Param("keyword") String keyword);

    // Count total active NGOs
    @Query("SELECT COUNT(n) FROM Ngo n WHERE n.user.isActive = true")
    long countActiveNgos();

    // Get total beneficiaries across all NGOs
    @Query("SELECT COALESCE(SUM(n.beneficiariesCount), 0) FROM Ngo n " +
            "WHERE n.user.isActive = true")
    Long getTotalBeneficiaries();

    // Get NGOs with dietary preferences matching food
    @Query("SELECT n FROM Ngo n WHERE n.user.isActive = true AND " +
            "(n.dietaryRequirements IS NULL OR " +
            "n.dietaryRequirements LIKE CONCAT('%', :dietaryInfo, '%'))")
    List<Ngo> findByDietaryMatch(@Param("dietaryInfo") String dietaryInfo);
}


