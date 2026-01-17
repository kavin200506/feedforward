package com.feedforward.service;

import com.feedforward.dto.request.LoginRequest;
import com.feedforward.dto.request.RegisterRequest;
import com.feedforward.dto.response.AuthResponse;
import com.feedforward.dto.response.UserProfileResponse;
import com.feedforward.entity.Ngo;
import com.feedforward.entity.Restaurant;
import com.feedforward.entity.User;
import com.feedforward.enums.Role;
import com.feedforward.exception.BadRequestException;
import com.feedforward.exception.DuplicateResourceException;
import com.feedforward.exception.ResourceNotFoundException;
import com.feedforward.repository.NgoRepository;
import com.feedforward.repository.RestaurantRepository;
import com.feedforward.repository.UserRepository;
import com.feedforward.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final NgoRepository ngoRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    /**
     * Register a new user (Restaurant or NGO)
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        logger.info("Registering new user with email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        // Check if phone already exists
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("User", "phone", request.getPhone());
        }

        // Validate role-specific fields
        validateRegistrationRequest(request);

        // Create user entity
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .role(request.getRole())
                .isActive(true)
                .build();

        // Save user
        user = userRepository.save(user);
        logger.info("User created with ID: {}", user.getUserId());

        // Create role-specific entity
        if (request.getRole() == Role.RESTAURANT) {
            createRestaurant(user, request);
        } else if (request.getRole() == Role.NGO) {
            createNgo(user, request);
        }

        // Generate JWT token
        String token = tokenProvider.generateTokenFromEmail(
                user.getEmail(),
                user.getUserId(),
                user.getRole().name(),
                user.getName()
        );

        // Build user profile
        UserProfileResponse profile = buildUserProfile(user);

        logger.info("User registered successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .profile(profile)
                .build();
    }

    /**
     * Login user
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        logger.info("Login attempt for email: {}", request.getEmail());

        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT token
        String token = tokenProvider.generateToken(authentication);

        // Get user details
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        // Build user profile
        UserProfileResponse profile = buildUserProfile(user);

        logger.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .profile(profile)
                .build();
    }

    /**
     * Get current user profile
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return buildUserProfile(user);
    }

    // Helper: Create restaurant entity
    private void createRestaurant(User user, RegisterRequest request) {
        Restaurant restaurant = Restaurant.builder()
                .user(user)
                .organizationName(request.getOrganizationName())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .cuisineType(request.getCuisineType())
                .build();

        restaurantRepository.save(restaurant);
        logger.info("Restaurant created with ID: {}", restaurant.getRestaurantId());
    }

    // Helper: Create NGO entity
    private void createNgo(User user, RegisterRequest request) {
        Ngo ngo = Ngo.builder()
                .user(user)
                .organizationName(request.getOrganizationName())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .beneficiariesCount(request.getBeneficiariesCount())
                .foodPreferences(request.getFoodPreferences())
                .dietaryRequirements(request.getDietaryRequirements())
                .build();

        ngoRepository.save(ngo);
        logger.info("NGO created with ID: {}", ngo.getNgoId());
    }

    // Helper: Validate registration request
    private void validateRegistrationRequest(RegisterRequest request) {
        if (request.getRole() == Role.RESTAURANT) {
            if (request.getCuisineType() == null || request.getCuisineType().isBlank()) {
                throw new BadRequestException("Cuisine type is required for restaurants");
            }
        } else if (request.getRole() == Role.NGO) {
            if (request.getBeneficiariesCount() == null || request.getBeneficiariesCount() < 1) {
                throw new BadRequestException("Beneficiaries count is required for NGOs");
            }
        }
    }

    // Helper: Build user profile response
    private UserProfileResponse buildUserProfile(User user) {
        UserProfileResponse.UserProfileResponseBuilder builder = UserProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .role(user.getRole().name());

        if (user.getRole() == Role.RESTAURANT) {
            Restaurant restaurant = restaurantRepository.findByUser_UserId(user.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

            builder.organizationName(restaurant.getOrganizationName())
                    .address(restaurant.getAddress())
                    .latitude(restaurant.getLatitude())
                    .longitude(restaurant.getLongitude())
                    .cuisineType(restaurant.getCuisineType())
                    .rating(restaurant.getRating())
                    .totalDonations(restaurant.getTotalDonations())
                    .totalServingsDonated(restaurant.getTotalServingsDonated());

        } else if (user.getRole() == Role.NGO) {
            Ngo ngo = ngoRepository.findByUser_UserId(user.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("NGO not found"));

            builder.organizationName(ngo.getOrganizationName())
                    .address(ngo.getAddress())
                    .latitude(ngo.getLatitude())
                    .longitude(ngo.getLongitude())
                    .beneficiariesCount(ngo.getBeneficiariesCount())
                    .foodPreferences(ngo.getFoodPreferences())
                    .dietaryRequirements(ngo.getDietaryRequirements())
                    .totalReceived(ngo.getTotalReceived())
                    .totalServingsReceived(ngo.getTotalServingsReceived());
        }

        return builder.build();
    }
}


