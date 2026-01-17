package com.feedforward.service;

import com.feedforward.dto.request.RegisterRequest;
import com.feedforward.dto.response.AuthResponse;
import com.feedforward.entity.User;
import com.feedforward.enums.Role;
import com.feedforward.exception.DuplicateResourceException;
import com.feedforward.repository.NgoRepository;
import com.feedforward.repository.RestaurantRepository;
import com.feedforward.repository.UserRepository;
import com.feedforward.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private NgoRepository ngoRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setName("Test Restaurant");
        registerRequest.setEmail("test@restaurant.com");
        registerRequest.setPhone("9876543210");
        registerRequest.setPassword("password123");
        registerRequest.setRole(Role.RESTAURANT);
        registerRequest.setOrganizationName("Test Restaurant Org");
        registerRequest.setAddress("123 Test Street");
        registerRequest.setLatitude(new BigDecimal("13.0827"));
        registerRequest.setLongitude(new BigDecimal("80.2707"));
        registerRequest.setCuisineType("Indian");
    }

    @Test
    void testRegister_Success() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByPhone(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User user = i.getArgument(0);
            user.setUserId(1L);
            return user;
        });
        when(tokenProvider.generateTokenFromEmail(anyString(), anyLong(), anyString(), anyString()))
                .thenReturn("test-token");

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals("test-token", response.getToken());
        assertEquals("test@restaurant.com", response.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
        verify(restaurantRepository, times(1)).save(any());
    }

    @Test
    void testRegister_DuplicateEmail() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicateResourceException.class, () -> {
            authService.register(registerRequest);
        });

        verify(userRepository, never()).save(any(User.class));
    }
}


