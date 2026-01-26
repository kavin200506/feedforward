import React, { useState } from 'react';
import { Modal, Input, Button, Badge } from '../common';
import { ngoService } from '../../services';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { formatTimeRemaining, calculateUrgency } from '../../utils/helpers';
import { FiMapPin, FiPhone, FiClock, FiPackage } from 'react-icons/fi';
import { FOOD_CATEGORIES } from '../../utils/constants';
import './RequestFoodModal.css';

const RequestFoodModal = ({ isOpen, onClose, food, onSuccess }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    quantityRequested: '',
    urgencyLevel: 'MEDIUM',
    notes: '',
    pickupTime: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Calculate suggested quantity based on beneficiaries
  const suggestedQuantity = Math.ceil((user?.beneficiariesCount || 100) * 0.2);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.quantityRequested || formData.quantityRequested <= 0) {
      newErrors.quantityRequested = 'Quantity is required';
    } else if (formData.quantityRequested >= food.quantity) {
      newErrors.quantityRequested = `Quantity must be less than available quantity (${food.quantity})`;
    }

    if (!formData.pickupTime) {
      newErrors.pickupTime = 'Pickup time is required';
    } else {
      const pickupDate = new Date(formData.pickupTime);
      const now = new Date();
      if (pickupDate <= now) {
        newErrors.pickupTime = 'Pickup time must be in the future';
      }
    }

    if (!formData.pickupTime) {
      newErrors.pickupTime = 'Pickup time is required';
    } else {
        const selectedTime = new Date(formData.pickupTime);
        const expiryTime = new Date(food.expiryTime);
        const now = new Date();

        if (selectedTime < now) {
            newErrors.pickupTime = 'Pickup time cannot be in the past';
        } else if (selectedTime > expiryTime) {
            newErrors.pickupTime = 'Pickup time cannot be after expiry';
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const quantityRequested = parseInt(formData.quantityRequested);
      await ngoService.requestFood({
        listingId: food.listingId,
        quantityRequested,
        urgencyLevel: formData.urgencyLevel,
        pickupTime: formData.pickupTime,
        notes: formData.notes,
        pickupTime: formData.pickupTime,
      });

      showSuccess('Request sent successfully! Your request has been automatically approved.');
      
      // Pass requested quantity to parent for optimistic update
      if (onSuccess) {
        onSuccess(quantityRequested);
      }
      handleClose();
    } catch (error) {
      // Extract error message from API response
      const errorMessage = error?.message || 
                          error?.response?.data?.message || 
                          error?.data?.message ||
                          'An unexpected error occurred. Please try again later.';
      console.error('Request food error:', error);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      quantityRequested: '',
      urgencyLevel: 'MEDIUM',
      notes: '',
      pickupTime: '',
    });
    setErrors({});
    onClose();
  };

  const urgency = calculateUrgency(food.expiryTime);
  const estimatedPickupTime = new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getCategoryEmoji = (category) => {
    if (food?.categoryEmoji) return food.categoryEmoji;
    const fromConstants = FOOD_CATEGORIES.find((c) => c.value === category);
    return fromConstants?.emoji || '🍽️';
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Food Donation" size="medium">
      <form className="request-food-form" onSubmit={handleSubmit}>
        {/* Food Summary */}
        <div className="food-summary">
          <div className="food-summary-icon">
            {getCategoryEmoji(food.category)}
          </div>
          <div className="food-summary-details">
            <h3 className="food-summary-title">{food.foodName}</h3>
            <p className="food-summary-restaurant">{food.restaurantName}</p>
            <div className="food-summary-meta">
              <Badge color={urgency.color}>
                {formatTimeRemaining(food.expiryTime)}
              </Badge>
              <span className="available-quantity">
                Available: {food.quantity} {food.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Request Form */}
        <div className="form-section">
          <Input
            label="Quantity Needed"
            type="number"
            name="quantityRequested"
            placeholder="Enter servings needed"
            value={formData.quantityRequested}
            onChange={handleChange}
            error={errors.quantityRequested}
            helperText={`Based on ${user?.beneficiariesCount || 100} beneficiaries, we suggest: ${suggestedQuantity} ${food.unit}`}
            min={1}
            max={food.quantity - 1}
            required
          />
        </div>

          <div className="input-wrapper">
            <label className="input-label">
              Preferred Pickup Time <span className="input-required">*</span>
            </label>
            <Input
              type="datetime-local"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleChange}
              error={errors.pickupTime}
              min={new Date().toISOString().slice(0, 16)}
              max={food.expiryTime}
              required
            />
            <div className="estimate-details" style={{ marginTop: '0.5rem' }}>
              <div className="estimate-item">
                <FiClock size={16} />
                <span>Expires: {new Date(food.expiryTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
              <div className="estimate-item">
                <FiMapPin size={16} />
                <span>{food.distance} km from you</span>
              </div>
            </div>
          </div>

        {/* Info Box */}
        <div className="info-box">
          <div className="info-box-icon">ℹ️</div>
          <div className="info-box-content">
            <strong>What happens next?</strong>
            <p>
              The restaurant will review your request. Since you've provided a pickup time, approval will be faster!
            </p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="modal-footer">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Send Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RequestFoodModal;
