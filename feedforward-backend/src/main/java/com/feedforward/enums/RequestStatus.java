package com.feedforward.enums;

public enum RequestStatus {
    PENDING,      // Request sent, waiting for restaurant approval
    APPROVED,     // Restaurant approved, waiting for pickup
    ACCEPTED,     // Restaurant accepted the request (with food details provided)
    REJECTED,     // Restaurant rejected the request
    PICKED_UP,    // NGO picked up the food
    COMPLETED,    // Donation completed successfully
    CANCELLED     // Request cancelled by NGO
}


