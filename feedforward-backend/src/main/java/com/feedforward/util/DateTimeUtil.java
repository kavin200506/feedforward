package com.feedforward.util;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeUtil {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = 
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private static final DateTimeFormatter DATE_FORMATTER = 
            DateTimeFormatter.ofPattern("dd MMM yyyy");

    /**
     * Format date time for display
     */
    public static String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return dateTime.format(DATE_TIME_FORMATTER);
    }

    /**
     * Format date for display
     */
    public static String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return dateTime.format(DATE_FORMATTER);
    }

    /**
     * Calculate time remaining in human-readable format
     */
    public static String getTimeRemaining(LocalDateTime futureTime) {
        if (futureTime == null) return "N/A";

        Duration duration = Duration.between(LocalDateTime.now(), futureTime);

        if (duration.isNegative()) {
            return "Expired";
        }

        long days = duration.toDays();
        long hours = duration.toHours() % 24;
        long minutes = duration.toMinutes() % 60;

        if (days > 0) {
            return String.format("%d day%s %d hr%s", days, days > 1 ? "s" : "", hours, hours > 1 ? "s" : "");
        } else if (hours > 0) {
            return String.format("%d hr%s %d min%s", hours, hours > 1 ? "s" : "", minutes, minutes > 1 ? "s" : "");
        } else {
            return String.format("%d min%s", minutes, minutes > 1 ? "s" : "");
        }
    }

    /**
     * Check if time has passed
     */
    public static boolean isPast(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isBefore(LocalDateTime.now());
    }

    /**
     * Get start of current month
     */
    public static LocalDateTime getStartOfMonth() {
        return LocalDateTime.now()
                .withDayOfMonth(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);
    }

    /**
     * Get start of current day
     */
    public static LocalDateTime getStartOfDay() {
        return LocalDateTime.now()
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);
    }
}


