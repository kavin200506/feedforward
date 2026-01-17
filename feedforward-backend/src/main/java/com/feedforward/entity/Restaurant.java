package com.feedforward.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "restaurants",
       indexes = {
           @Index(name = "idx_location", columnList = "latitude, longitude"),
           @Index(name = "idx_user_id", columnList = "user_id")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "restaurant_id")
    private Long restaurantId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @NotBlank(message = "Organization name is required")
    @Column(name = "organization_name", nullable = false)
    private String organizationName;

    @NotBlank(message = "Address is required")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String address;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "cuisine_type", length = 100)
    private String cuisineType;

    @Column(precision = 2, scale = 1)
    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "total_donations")
    @Builder.Default
    private Integer totalDonations = 0;

    @Column(name = "total_servings_donated")
    @Builder.Default
    private Integer totalServingsDonated = 0;

    // Relationships
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FoodListing> foodListings = new ArrayList<>();

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DonationHistory> donations = new ArrayList<>();

    // Helper methods
    public void incrementDonations(int servings) {
        this.totalDonations++;
        this.totalServingsDonated += servings;
    }

    public void updateRating(BigDecimal newRating) {
        if (this.rating.compareTo(BigDecimal.ZERO) == 0) {
            this.rating = newRating;
        } else {
            // Calculate average: (currentRating * totalDonations + newRating) / (totalDonations + 1)
            BigDecimal totalRating = this.rating.multiply(BigDecimal.valueOf(this.totalDonations));
            this.rating = totalRating.add(newRating)
                    .divide(BigDecimal.valueOf(this.totalDonations + 1), 1, RoundingMode.HALF_UP);
        }
    }
}

