package com.feedforward.entity;

import com.feedforward.enums.RequestStatus;
import com.feedforward.enums.UrgencyLevel;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "food_requests",
       indexes = {
           @Index(name = "idx_status", columnList = "status"),
           @Index(name = "idx_listing", columnList = "listing_id"),
           @Index(name = "idx_ngo", columnList = "ngo_id")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private FoodListing foodListing;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ngo_id", nullable = false)
    private Ngo ngo;

    @NotNull(message = "Quantity requested is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(name = "quantity_requested", nullable = false)
    private Integer quantityRequested;

    @NotNull(message = "Urgency level is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "urgency_level", nullable = false, length = 20)
    private UrgencyLevel urgencyLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "restaurant_response", columnDefinition = "TEXT")
    private String restaurantResponse;

    @Column(name = "pickup_time")
    private LocalDateTime pickupTime;

    @Column(name = "picked_up_at")
    private LocalDateTime pickedUpAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Helper methods
    public void approve(String response, LocalDateTime pickupTime) {
        this.status = RequestStatus.APPROVED;
        this.restaurantResponse = response;
        this.pickupTime = pickupTime;
    }

    public void reject(String reason) {
        this.status = RequestStatus.REJECTED;
        this.restaurantResponse = reason;
    }

    public void markAsPickedUp() {
        this.status = RequestStatus.PICKED_UP;
        this.pickedUpAt = LocalDateTime.now();
    }

    public void complete() {
        this.status = RequestStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    public void cancel() {
        this.status = RequestStatus.CANCELLED;
    }
}


