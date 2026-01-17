package com.feedforward.entity;

import com.feedforward.enums.FoodCategory;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "donation_history",
       indexes = {
           @Index(name = "idx_restaurant", columnList = "restaurant_id"),
           @Index(name = "idx_ngo", columnList = "ngo_id"),
           @Index(name = "idx_donated_at", columnList = "donated_at")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "donation_id")
    private Long donationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ngo_id", nullable = false)
    private Ngo ngo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private FoodRequest foodRequest;

    @NotBlank(message = "Food name is required")
    @Column(name = "food_name", nullable = false)
    private String foodName;

    @NotNull(message = "Quantity donated is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(name = "quantity_donated", nullable = false)
    private Integer quantityDonated;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private FoodCategory category;

    @Column(name = "donated_at", nullable = false)
    @Builder.Default
    private LocalDateTime donatedAt = LocalDateTime.now();

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    @Column(name = "restaurant_rating")
    private Integer restaurantRating;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    @Column(name = "ngo_rating")
    private Integer ngoRating;

    @Column(name = "restaurant_feedback", columnDefinition = "TEXT")
    private String restaurantFeedback;

    @Column(name = "ngo_feedback", columnDefinition = "TEXT")
    private String ngoFeedback;
}


