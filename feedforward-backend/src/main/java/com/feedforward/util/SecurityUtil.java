package com.feedforward.util;

import com.feedforward.enums.Role;
import com.feedforward.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    // Get currently authenticated user details
    public static CustomUserDetails getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            return (CustomUserDetails) authentication.getPrincipal();
        }
        
        return null;
    }

    // Get current user ID
    public static Long getCurrentUserId() {
        CustomUserDetails userDetails = getCurrentUser();
        return userDetails != null ? userDetails.getUserId() : null;
    }

    // Get current user email
    public static String getCurrentUserEmail() {
        CustomUserDetails userDetails = getCurrentUser();
        return userDetails != null ? userDetails.getEmail() : null;
    }

    // Get current user role
    public static String getCurrentUserRole() {
        CustomUserDetails userDetails = getCurrentUser();
        return userDetails != null ? userDetails.getRole() : null;
    }

    // Check if current user has specific role
    public static boolean hasRole(Role role) {
        CustomUserDetails userDetails = getCurrentUser();
        return userDetails != null && userDetails.hasRole(role);
    }

    // Check if user is authenticated
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() 
                && !(authentication.getPrincipal() instanceof String);
    }

    // Check if current user is restaurant
    public static boolean isRestaurant() {
        return hasRole(Role.RESTAURANT);
    }

    // Check if current user is NGO
    public static boolean isNgo() {
        return hasRole(Role.NGO);
    }
}


