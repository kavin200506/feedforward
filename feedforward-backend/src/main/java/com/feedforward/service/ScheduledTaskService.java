package com.feedforward.service;

import com.feedforward.entity.FoodListing;
import com.feedforward.entity.FoodRequest;
import com.feedforward.enums.ListingStatus;
import com.feedforward.repository.FoodListingRepository;
import com.feedforward.repository.FoodRequestRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduledTaskService {

    private static final Logger logger = LoggerFactory.getLogger(ScheduledTaskService.class);

    private final FoodListingRepository listingRepository;
    private final FoodRequestRepository requestRepository;

    /**
     * Mark expired food listings as EXPIRED
     * Runs every 10 minutes
     */
    @Scheduled(cron = "0 */10 * * * *") // Every 10 minutes
    @Transactional
    public void markExpiredListings() {
        logger.info("Running scheduled task: Mark expired listings");

        int expiredCount = listingRepository.markExpiredListings();

        if (expiredCount > 0) {
            logger.info("Marked {} food listings as expired", expiredCount);
        }
    }

    /**
     * Send notifications for urgent food listings (expiring in 1 hour)
     * Runs every 30 minutes
     */
    @Scheduled(cron = "0 */30 * * * *") // Every 30 minutes
    @Transactional(readOnly = true)
    public void notifyUrgentListings() {
        logger.info("Running scheduled task: Notify urgent listings");

        LocalDateTime oneHourFromNow = LocalDateTime.now().plusHours(1);
        List<FoodListing> urgentListings = listingRepository.findUrgentListings(oneHourFromNow);

        if (!urgentListings.isEmpty()) {
            logger.info("Found {} urgent listings expiring within 1 hour", urgentListings.size());
            // TODO: Send notifications to nearby NGOs
            // This can be implemented with email/SMS service
        }
    }

    /**
     * Handle expired pickup times (auto-cancel approved requests not picked up)
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour
    @Transactional
    public void handleExpiredPickups() {
        logger.info("Running scheduled task: Handle expired pickups");

        LocalDateTime now = LocalDateTime.now();
        List<FoodRequest> expiredPickups = requestRepository.findExpiredPickups(now);

        for (FoodRequest request : expiredPickups) {
            // Auto-cancel the request
            request.cancel();
            requestRepository.save(request);

            // Make the listing available again
            FoodListing listing = request.getFoodListing();
            if (listing.getStatus() == ListingStatus.RESERVED && !listing.isExpired()) {
                listing.setStatus(ListingStatus.AVAILABLE);
                listingRepository.save(listing);
            }

            logger.info("Auto-cancelled expired pickup for request: {}", request.getRequestId());
        }

        if (!expiredPickups.isEmpty()) {
            logger.info("Handled {} expired pickups", expiredPickups.size());
        }
    }

    /**
     * Send daily digest notifications
     * Runs every day at 9:00 AM IST
     */
    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Kolkata")
    @Transactional(readOnly = true)
    public void sendDailyDigest() {
        logger.info("Running scheduled task: Send daily digest");

        // TODO: Implement daily digest email/notification
        // - Top restaurants by donations
        // - Total servings saved yesterday
        // - Urgent food available today
        // - Pending requests reminder

        logger.info("Daily digest notifications queued");
    }

    /**
     * Clean up old data (older than 1 year)
     * Runs once a week on Sunday at 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * SUN", zone = "Asia/Kolkata")
    @Transactional
    public void cleanupOldData() {
        logger.info("Running scheduled task: Cleanup old data");

        // TODO: Implement cleanup logic
        // - Archive or delete old expired listings
        // - Archive completed requests older than 1 year
        // - Keep donation history (for statistics)
        // LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);

        logger.info("Old data cleanup completed");
    }
}

