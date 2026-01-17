import React, { useState } from 'react';
import { Modal, Input, Button, Badge } from '../common';
import { ngoService } from '../../services';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { formatTimeRemaining, calculateUrgency } from '../../utils/helpers';
import { FiMapPin, FiPhone, FiClock, FiPackage } from 'react-icons/fi';
import './RequestFoodModal.css';

const RequestFoodModal = ({ isOpen, onClose, food, onSuccess }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    quantityRequested: '',
    urgencyLevel: 'MEDIUM',
    notes: '',
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
    } else if (formData.quantityRequested > food.quantity) {
      newErrors.quantityRequested = `Cannot exceed available quantity (${food.quantity})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await ngoService.requestFood({
        listingId: food.listingId,
        quantityRequested: parseInt(formData.quantityRequested),
        urgencyLevel: formData.urgencyLevel,
        notes: formData.notes,
      });

      showSuccess('Request sent successfully! The restaurant will review it shortly.');
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      showError(error.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      quantityRequested: '',
      urgencyLevel: 'MEDIUM',
      notes: '',
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
    const emojiMap = {
      'Cooked Rice': '🍚',
      'Vegetables': '🥗',
      'Bread': '🍞',
      'Proteins': '🍗',
      'Sweets': '🍰',
      'Other': '📦',
    };
    return emojiMap[category] || '🍽️';
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
            max={food.quantity}
            required
          />

          <div className="input-wrapper">
            <label className="input-label">
              Urgency Level <span className="input-required">*</span>
            </label>
            <div className="urgency-options">
              <label className={`urgency-option ${formData.urgencyLevel === 'LOW' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="urgencyLevel"
                  value="LOW"
                  checked={formData.urgencyLevel === 'LOW'}
                  onChange={handleChange}
                />
                <div className="urgency-content">
                  <span className="urgency-icon">⚪</span>
                  <div>
                    <div className="urgency-label">Low</div>
                    <div className="urgency-desc">Can pick up anytime</div>
                  </div>
                </div>
              </label>

              <label className={`urgency-option ${formData.urgencyLevel === 'MEDIUM' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="urgencyLevel"
                  value="MEDIUM"
                  checked={formData.urgencyLevel === 'MEDIUM'}
                  onChange={handleChange}
                />
                <div className="urgency-content">
                  <span className="urgency-icon">🟡</span>
                  <div>
                    <div className="urgency-label">Medium</div>
                    <div className="urgency-desc">Within 2 hours</div>
                  </div>
                </div>
              </label>

              <label className={`urgency-option ${formData.urgencyLevel === 'HIGH' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="urgencyLevel"
                  value="HIGH"
                  checked={formData.urgencyLevel === 'HIGH'}
                  onChange={handleChange}
                />
                <div className="urgency-content">
                  <span className="urgency-icon">🟠</span>
                  <div>
                    <div className="urgency-label">High</div>
                    <div className="urgency-desc">Within 1 hour</div>
                  </div>
                </div>
              </label>

              <label className={`urgency-option ${formData.urgencyLevel === 'CRITICAL' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="urgencyLevel"
                  value="CRITICAL"
                  checked={formData.urgencyLevel === 'CRITICAL'}
                  onChange={handleChange}
                />
                <div className="urgency-content">
                  <span className="urgency-icon">🔴</span>
                  <div>
                    <div className="urgency-label">Critical</div>
                    <div className="urgency-desc">Immediately</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="input-wrapper">
            <label className="input-label">Additional Notes (Optional)</label>
            <textarea
              name="notes"
              className="input textarea"
              placeholder="Any specific instructions or requirements..."
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              maxLength={250}
            />
            <span className="char-count">{formData.notes.length}/250 characters</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="info-box">
          <div className="info-box-icon">ℹ️</div>
          <div className="info-box-content">
            <strong>What happens next?</strong>
            <p>
              The restaurant will review your request and respond shortly. 
              You'll be notified via the dashboard once approved.
            </p>
          </div>
        </div>

        {/* Pickup Estimate */}
        <div className="pickup-estimate">
          <div className="estimate-icon">🚗</div>
          <div className="estimate-content">
            <div className="estimate-label">Estimated Pickup Details:</div>
            <div className="estimate-details">
              <div className="estimate-item">
                <FiClock size={16} />
                <span>~{estimatedPickupTime} (approx)</span>
              </div>
              <div className="estimate-item">
                <FiMapPin size={16} />
                <span>{food.distance} km • ~{Math.ceil(food.distance * 3)} min travel</span>
              </div>
              <div className="estimate-item">
                <FiPhone size={16} />
                <span>Contact details provided after approval</span>
              </div>
            </div>
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
