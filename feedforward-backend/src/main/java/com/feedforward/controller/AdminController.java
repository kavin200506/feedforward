package com.feedforward.controller;

import com.feedforward.dto.response.ApiResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Temporary Admin Controller for database operations
 * WARNING: Remove this in production or secure it properly!
 */
@RestController
@RequestMapping("/admin")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @PersistenceContext
    private EntityManager entityManager;

    @Value("${admin.secret.key:CHANGE_THIS_IN_PRODUCTION}")
    private String adminSecretKey;

    /**
     * Truncate all tables in the database
     * POST /api/admin/truncate-all?secret=YOUR_SECRET_KEY
     */
    @PostMapping("/truncate-all")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> truncateAllTables(
            @RequestParam(required = false) String secret
    ) {
        // Simple security check - in production, use proper authentication
        if (secret == null || !secret.equals(adminSecretKey)) {
            logger.warn("Unauthorized truncate attempt");
            return ResponseEntity.status(401).body(
                ApiResponse.error("Unauthorized. Provide correct secret key.")
            );
        }

        try {
            logger.warn("⚠️ TRUNCATING ALL TABLES - This is a destructive operation!");

            // Disable foreign key checks
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();

            // Truncate tables in correct order
            entityManager.createNativeQuery("TRUNCATE TABLE donation_history").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE food_requests").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE food_listings").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE ngos").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE restaurants").executeUpdate();
            entityManager.createNativeQuery("TRUNCATE TABLE users").executeUpdate();

            // Re-enable foreign key checks
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();

            // Get counts to verify
            Long usersCount = ((Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM users").getSingleResult()).longValue();
            Long restaurantsCount = ((Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM restaurants").getSingleResult()).longValue();
            Long ngosCount = ((Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM ngos").getSingleResult()).longValue();
            Long listingsCount = ((Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM food_listings").getSingleResult()).longValue();
            Long requestsCount = ((Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM food_requests").getSingleResult()).longValue();
            Long donationsCount = ((Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM donation_history").getSingleResult()).longValue();

            Map<String, Object> result = new HashMap<>();
            result.put("message", "All tables truncated successfully in Railway MySQL!");
            result.put("counts", Map.of(
                "users", usersCount,
                "restaurants", restaurantsCount,
                "ngos", ngosCount,
                "food_listings", listingsCount,
                "food_requests", requestsCount,
                "donation_history", donationsCount
            ));

            logger.info("✅ All tables truncated successfully");

            return ResponseEntity.ok(ApiResponse.success("All tables truncated successfully", result));
        } catch (Exception e) {
            logger.error("Error truncating tables", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("Failed to truncate tables: " + e.getMessage())
            );
        }
    }
}

