package com.feedforward.util;

import java.math.BigDecimal;

public class DistanceCalculator {

    private static final int EARTH_RADIUS_KM = 6371;

    /**
     * Calculate distance between two points using Haversine formula
     */
    public static double calculateDistance(
            BigDecimal lat1, BigDecimal lon1,
            BigDecimal lat2, BigDecimal lon2
    ) {
        return calculateDistance(
                lat1.doubleValue(), lon1.doubleValue(),
                lat2.doubleValue(), lon2.doubleValue()
        );
    }

    public static double calculateDistance(
            double lat1, double lon1,
            double lat2, double lon2
    ) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    /**
     * Check if point is within radius
     */
    public static boolean isWithinRadius(
            BigDecimal lat1, BigDecimal lon1,
            BigDecimal lat2, BigDecimal lon2,
            double radiusKm
    ) {
        double distance = calculateDistance(lat1, lon1, lat2, lon2);
        return distance <= radiusKm;
    }
}


