import React from 'react';
import { Card, Badge, Button } from '../common';
import { FiMapPin, FiClock, FiPackage, FiStar } from 'react-icons/fi';
import { formatTimeRemaining, calculateUrgency } from '../../utils/helpers';
import { FOOD_CATEGORIES } from '../../utils/constants';
import './FoodCard.css';

const FoodCard = ({ food, onRequest }) => {
  const urgency = calculateUrgency(food.expiryTime);
  
  const getCategoryEmoji = (category) => {
    if (food?.categoryEmoji) return food.categoryEmoji;
    const fromConstants = FOOD_CATEGORIES.find((c) => c.value === category);
    return fromConstants?.emoji || '🍽️';
  };

  const getCategoryLabel = (category) => {
    const fromConstants = FOOD_CATEGORIES.find((c) => c.value === category);
    return fromConstants?.label?.replace(/^[^\s]+\s/, '') || category; // strip emoji from label for text
  };

  return (
    <Card className="food-card" hover>
      {/* Urgency Ribbon */}
      <div className="urgency-ribbon" style={{ backgroundColor: urgency.color }}>
        <FiClock size={14} />
        <span>{formatTimeRemaining(food.expiryTime)}</span>
      </div>

      {/* Match Score Badge (if available) */}
      {food.matchScore && (
        <div className="match-score-badge">
          ⭐ {food.matchScore}/100
        </div>
      )}

      {/* Card Header */}
      <div className="food-card-header">
        <div className="category-icon">{getCategoryEmoji(food.category)}</div>
      </div>

      {/* Card Body */}
      <div className="food-card-body">
        <h3 className="food-card-title">{food.foodName}</h3>
        <div className="food-card-category">
          <Badge variant="default" size="small">
            {getCategoryLabel(food.category)}
          </Badge>
        </div>

        <div className="restaurant-info">
          <h4 className="restaurant-name">{food.restaurantName}</h4>
          {food.restaurantRating && (
            <div className="restaurant-rating">
              <FiStar size={14} fill="#FFC107" color="#FFC107" />
              <span>{food.restaurantRating}</span>
              {food.totalDonations && (
                <span className="donation-count">({food.totalDonations} donations)</span>
              )}
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="food-details-grid">
          <div className="detail-item">
            <FiPackage size={16} className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Quantity</span>
              <span className="detail-value">{food.quantity} {food.unit}</span>
            </div>
          </div>

          <div className="detail-item">
            <FiMapPin size={16} className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Distance</span>
              <span className="detail-value">{food.distance} km</span>
            </div>
          </div>

          <div className="detail-item">
            <FiClock size={16} className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Expires</span>
              <span className="detail-value" style={{ color: urgency.color }}>
                {formatTimeRemaining(food.expiryTime)}
              </span>
            </div>
          </div>

          {food.dietaryInfo && (
            <div className="detail-item full-width">
              <span className="detail-icon">🍽️</span>
              <div className="detail-content">
                <span className="detail-label">Dietary</span>
                <div className="dietary-badges">
                  {food.dietaryInfo.split(',').map((info, index) => (
                    <Badge key={index} variant="outline" size="small">
                      {info.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {food.description && (
          <p className="food-description">{food.description}</p>
        )}
      </div>

      {/* Card Footer */}
      <div className="food-card-footer">
        <Button
          variant="primary"
          fullWidth
          icon={<span>🤝</span>}
          onClick={() => onRequest(food)}
        >
          Request This Food
        </Button>
      </div>
    </Card>
  );
};

export default FoodCard;
