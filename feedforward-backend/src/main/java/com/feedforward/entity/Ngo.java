package com.feedforward.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ngos",
       indexes = {
           @Index(name = "idx_location", columnList = "latitude, longitude"),
           @Index(name = "idx_user_id", columnList = "user_id")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ngo extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ngo_id")
    private Long ngoId;

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
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @NotNull(message = "Beneficiaries count is required")
    @Min(value = 1, message = "Beneficiaries count must be at least 1")
    @Column(name = "beneficiaries_count", nullable = false)
    private Integer beneficiariesCount;

    @Column(name = "food_preferences", columnDefinition = "TEXT")
    private String foodPreferences;

    @Column(name = "dietary_requirements", columnDefinition = "TEXT")
    private String dietaryRequirements;

    @Column(name = "total_received")
    @Builder.Default
    private Integer totalReceived = 0;

    @Column(name = "total_servings_received")
    @Builder.Default
    private Integer totalServingsReceived = 0;

    // Relationships
    @OneToMany(mappedBy = "ngo", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FoodRequest> foodRequests = new ArrayList<>();

    @OneToMany(mappedBy = "ngo", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DonationHistory> receivedDonations = new ArrayList<>();

    // Helper methods
    public void incrementReceived(int servings) {
        this.totalReceived++;
        this.totalServingsReceived += servings;
    }
}


