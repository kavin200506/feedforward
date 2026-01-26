package com.feedforward.entity;

import com.feedforward.enums.FoodCategory;
import com.feedforward.enums.ListingStatus;
import com.feedforward.enums.UrgencyLevel;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "food_listings",
       indexes = {
           @Index(name = "idx_status", columnList = "status"),
           @Index(name = "idx_expiry", columnList = "expiry_time"),
           @Index(name = "idx_restaurant", columnList = "restaurant_id")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodListing extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "listing_id")
    private Long listingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @NotBlank(message = "Food name is required")
    @Column(name = "food_name", nullable = false)
    private String foodName;

    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private FoodCategory category;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(nullable = false)
    private Integer quantity;

    @NotBlank(message = "Unit is required")
    @Column(nullable = false, length = 20)
    private String unit;

    @NotNull(message = "Prepared time is required")
    @Column(name = "prepared_time", nullable = false)
    private LocalDateTime preparedTime;

    @NotNull(message = "Expiry time is required")
    @Column(name = "expiry_time", nullable = false)
    private LocalDateTime expiryTime;

    @Column(name = "dietary_info", columnDefinition = "TEXT")
    private String dietaryInfo;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ListingStatus status = ListingStatus.AVAILABLE;

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency_level", nullable = false, length = 20)
    private UrgencyLevel urgencyLevel;

    // Relationships
    @OneToMany(mappedBy = "foodListing", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FoodRequest> requests = new ArrayList<>();

    @Column(name = "batch_number")
    @Builder.Default
    private Integer batchNumber = 1;

    @Column(name = "last_escalation_time")
    private LocalDateTime lastEscalationTime;

    // Helper methods
    @PrePersist
    @PreUpdate
    public void calculateUrgency() {
        if (expiryTime != null) {
            long hoursUntilExpiry = java.time.Duration.between(LocalDateTime.now(), expiryTime).toHours();
            
            if (hoursUntilExpiry < 1) {
                this.urgencyLevel = UrgencyLevel.CRITICAL;
            } else if (hoursUntilExpiry < 2) {
                this.urgencyLevel = UrgencyLevel.HIGH;
            } else if (hoursUntilExpiry < 4) {
                this.urgencyLevel = UrgencyLevel.MEDIUM;
            } else {
                this.urgencyLevel = UrgencyLevel.LOW;
            }
        }
        
        if (this.batchNumber == null) {
            this.batchNumber = 1;
        }
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryTime);
    }

    public boolean isAvailable() {
        return this.status == ListingStatus.AVAILABLE && !isExpired();
    }
}


