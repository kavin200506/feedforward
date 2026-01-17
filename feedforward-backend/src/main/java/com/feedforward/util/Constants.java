package com.feedforward.util;

public class Constants {

    // Distance Constants
    public static final double DEFAULT_SEARCH_RADIUS_KM = 10.0;
    public static final double MAX_SEARCH_RADIUS_KM = 50.0;

    // Food Constants
    public static final int MIN_FOOD_AVAILABILITY_MINUTES = 15;
    public static final int URGENT_THRESHOLD_HOURS = 1;

    // Match Score Weights
    public static final int DISTANCE_SCORE_WEIGHT = 40;
    public static final int QUANTITY_SCORE_WEIGHT = 25;
    public static final int URGENCY_SCORE_WEIGHT = 20;
    public static final int DIETARY_SCORE_WEIGHT = 15;

    // Environmental Impact
    public static final double CO2_PER_SERVING_KG = 0.5;
    public static final double COST_PER_SERVING_INR = 50.0;

    // Pagination
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;

    // Rating
    public static final int MIN_RATING = 1;
    public static final int MAX_RATING = 5;

    private Constants() {
        // Private constructor to prevent instantiation
    }
}


