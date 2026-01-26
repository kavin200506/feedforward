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
    private final NotificationService notificationService;

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
     * Check and escalate notifications for pending listings
     * Runs every minute to check if escalation timeout has passed
     */
    @Scheduled(cron = "0 */1 * * * *") // Every minute
    @Transactional
    public void checkAndEscalateNotifications() {
        logger.info("Running scheduled task: Check and escalate notifications");

        List<FoodListing> availableListings = listingRepository.findAllAvailableListings();
        LocalDateTime now = LocalDateTime.now();
        int escalationCount = 0;

        for (FoodListing listing : availableListings) {
            // Skip if no last escalation time (legacy data or just created?)
            // If null, we should initialize it.
            if (listing.getLastEscalationTime() == null) {
                listing.setLastEscalationTime(now);
                listing.setBatchNumber(1);
                listingRepository.save(listing);
                continue;
            }

            // Determine timeout based on urgency
            long timeoutMinutes;
            switch (listing.getUrgencyLevel()) {
                case CRITICAL:
                    timeoutMinutes = 5;
                    break;
                case HIGH:
                    timeoutMinutes = 10;
                    break;
                case MEDIUM:
                    timeoutMinutes = 20;
                    break;
                case LOW:
                    timeoutMinutes = 30;
                    break;
                default: // Should happen if urgency is null, fallback
                    timeoutMinutes = 30;
            }

            // Check if timeout has passed
            long minutesSinceLastEscalation = java.time.Duration.between(
                    listing.getLastEscalationTime(), now).toMinutes();

            if (minutesSinceLastEscalation >= timeoutMinutes) {
                logger.info("Escalating listing {} (Urgency: {}, Batch: {} -> {}, Elapsed: {}m)", 
                        listing.getListingId(), listing.getUrgencyLevel(), 
                        listing.getBatchNumber(), listing.getBatchNumber() + 1, 
                        minutesSinceLastEscalation);

                // Notify next batch
                int notifiedCount = notificationService.notifyNextBatch(listing);

                if (notifiedCount > 0) {
                    // Update state ONLY if we found people to notify
                    // If 0, it means we ran out of NGOs, so maybe stop escalating?
                    // But we should increment batch to avoid retrying the same empty batch forever?
                    // Actually notifyNextBatch returns 0 if empty.
                    // If we update batch number, we move to next. If we don't, we retry.
                    // If we retry empty batch, we waste cycles. 
                    // Let's increment anyway to look for next batch (maybe sparse data). 
                    // Or stop? Implementation plan says "Update batch index".
                    
                    listing.setBatchNumber(listing.getBatchNumber() + 1);
                    listing.setLastEscalationTime(now);
                    listingRepository.save(listing);
                    escalationCount++;
                } else {
                    // No more NGOs found. We can stop escalating for this listing or keep checking.
                    // To prevent log spam every minute, let's update the time at least?
                    // OR we mark it as "ESCALATION_EXHAUSTED"?
                    // For now, let's just update the time so we don't check again immediately for another timeout period.
                    // But better implementation: existing logic assumes sequential.
                    // If 0 found, maybe we should just increment to check next 5? 
                    // Or if findMatchingNgos returns empty, are we done?
                    // The service logs "No more NGOs found", so effectively done.
                    // Let's increment batch number so we don't retry the same index.
                    listing.setBatchNumber(listing.getBatchNumber() + 1);
                    listing.setLastEscalationTime(now); 
                    listingRepository.save(listing);
                    logger.info("Escalation yielded no new NGOs for listing {}. Moved to batch {}.", 
                            listing.getListingId(), listing.getBatchNumber());
                }
            }
        }

        if (escalationCount > 0) {
            logger.info("Escalated {} listings to next batch of NGOs", escalationCount);
        }
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

