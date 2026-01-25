package com.feedforward.service;

import com.feedforward.dto.request.ApproveRequestDto;
import com.feedforward.dto.response.FoodRequestResponse;
import com.feedforward.entity.*;
import com.feedforward.enums.ListingStatus;
import com.feedforward.enums.RequestStatus;
import com.feedforward.repository.*;
import com.feedforward.security.CustomUserDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RequestServiceTest {

    @Mock
    private FoodRequestRepository requestRepository;
    @Mock
    private FoodListingRepository listingRepository;
    @Mock
    private NgoRepository ngoRepository;
    @Mock
    private RestaurantRepository restaurantRepository;
    @Mock
    private DonationHistoryRepository donationHistoryRepository;
    @Mock
    private MatchingAlgorithmService matchingAlgorithmService;

    @InjectMocks
    private RequestService requestService;

    private User restaurantUser;
    private Restaurant restaurant;
    private FoodListing listing;
    private FoodRequest request;
    private ApproveRequestDto approveDto;

    @BeforeEach
    void setUp() {
        // Mock Security Context
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        CustomUserDetails userDetails = mock(CustomUserDetails.class);

        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getPrincipal()).thenReturn(userDetails);
        lenient().when(userDetails.getUserId()).thenReturn(1L); // Restaurant Owner ID

        SecurityContextHolder.setContext(securityContext);

        // Setup Entities
        restaurantUser = new User();
        restaurantUser.setUserId(1L);

        restaurant = new Restaurant();
        restaurant.setRestaurantId(1L);
        restaurant.setUser(restaurantUser);
        restaurant.setOrganizationName("Test Rest");
        restaurant.setAddress("Test Addr");
        restaurant.setLatitude(new BigDecimal("10.0"));
        restaurant.setLongitude(new BigDecimal("10.0"));

        listing = new FoodListing();
        listing.setListingId(10L);
        listing.setRestaurant(restaurant);
        listing.setQuantity(5);
        listing.setStatus(ListingStatus.AVAILABLE);
        listing.setExpiryTime(LocalDateTime.now().plusHours(5));
        listing.setFoodName("Test Food");

        Ngo ngo = new Ngo();
        ngo.setNgoId(2L);
        ngo.setOrganizationName("Test NGO");
        ngo.setLatitude(new BigDecimal("10.1"));
        ngo.setLongitude(new BigDecimal("10.1"));

        request = new FoodRequest();
        request.setRequestId(100L);
        request.setFoodListing(listing);
        request.setNgo(ngo);
        request.setQuantityRequested(2);
        request.setStatus(RequestStatus.PENDING);
        request.setUrgencyLevel(com.feedforward.enums.UrgencyLevel.HIGH);

        approveDto = new ApproveRequestDto();
        approveDto.setPickupTime(LocalDateTime.now().plusHours(1));
        approveDto.setResponse("Approved");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void approveRequest_PartialAllocation() {
        // Arrange
        when(requestRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(request));
        when(listingRepository.findByIdWithLock(10L)).thenReturn(Optional.of(listing));
        when(listingRepository.save(any(FoodListing.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(requestRepository.save(any(FoodRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        FoodRequestResponse response = requestService.approveRequest(100L, approveDto);

        // Assert
        assertEquals(3, listing.getQuantity()); // 5 - 2 = 3
        assertEquals(ListingStatus.AVAILABLE, listing.getStatus()); // Should still be available
        assertEquals(RequestStatus.APPROVED, request.getStatus());
        verify(listingRepository).save(listing);
    }

    @Test
    void approveRequest_FullAllocation() {
        // Arrange
        request.setQuantityRequested(5); // Requesting all
        
        when(requestRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(request));
        when(listingRepository.findByIdWithLock(10L)).thenReturn(Optional.of(listing));
        when(listingRepository.save(any(FoodListing.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(requestRepository.save(any(FoodRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        requestService.approveRequest(100L, approveDto);

        // Assert
        assertEquals(0, listing.getQuantity());
        assertEquals(ListingStatus.COMPLETED, listing.getStatus());
    }

    @Test
    void cancelRequest_RestoreQuantity() {
        // Arrange - Request is already APPROVED and quantity deducted
        request.setStatus(RequestStatus.APPROVED);
        listing.setQuantity(3); // Suppose it was 5 originally, 2 requested
        
        // Mock USER as NGO for cancellation (User ID 2)
        // Need to reset security context for NGO user
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getPrincipal()).thenReturn(userDetails);
        lenient().when(userDetails.getUserId()).thenReturn(2L); // NGO ID matches Request NGO User ID
        
        User ngoUser = new User();
        ngoUser.setUserId(2L);
        request.getNgo().setUser(ngoUser);
        
        SecurityContextHolder.setContext(securityContext);

        when(requestRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(request));
        when(listingRepository.findByIdWithLock(10L)).thenReturn(Optional.of(listing));

        // Act
        requestService.cancelRequest(100L);

        // Assert
        assertEquals(5, listing.getQuantity()); // 3 + 2 = 5
        assertEquals(RequestStatus.CANCELLED, request.getStatus());
        assertEquals(ListingStatus.AVAILABLE, listing.getStatus());
    }
}
