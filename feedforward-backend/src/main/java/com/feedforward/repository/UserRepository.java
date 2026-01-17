package com.feedforward.repository;

import com.feedforward.entity.User;
import com.feedforward.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by email
    Optional<User> findByEmail(String email);

    // Check if email exists
    boolean existsByEmail(String email);

    // Find user by email and role
    Optional<User> findByEmailAndRole(String email, Role role);

    // Check if phone number exists
    boolean existsByPhone(String phone);

    // Find all active users by role
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.isActive = true")
    java.util.List<User> findActiveUsersByRole(@Param("role") Role role);

    // Count users by role
    long countByRole(Role role);

    // Find user with restaurant details
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.restaurant WHERE u.userId = :userId")
    Optional<User> findByIdWithRestaurant(@Param("userId") Long userId);

    // Find user with NGO details
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.ngo WHERE u.userId = :userId")
    Optional<User> findByIdWithNgo(@Param("userId") Long userId);
}


