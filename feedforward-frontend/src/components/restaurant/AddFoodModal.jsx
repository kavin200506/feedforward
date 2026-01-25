import React, { useState } from 'react';
import { Modal, Input, Button } from '../common';
import { foodListingService } from '../../services';
import { useNotification } from '../../context/NotificationContext';
import NearbyNgosCard from './NearbyNgosCard';
import { FOOD_CATEGORIES, FOOD_UNITS, DIETARY_OPTIONS } from '../../utils/constants';
import { calculateUrgency } from '../../utils/helpers';
import './AddFoodModal.css';

const AddFoodModal = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    foodName: '',
    category: '',
    quantity: '',
    unit: 'Servings',
    preparedTime: '',
    expiryTime: '',
    dietaryInfo: [],
    description: '',
  });

  const [suggestedNgos, setSuggestedNgos] = useState([]);
  const [nearbyNgoPlaces, setNearbyNgoPlaces] = useState([]);
  const [top5RegisteredNgos, setTop5RegisteredNgos] = useState([]);
  const [notifiedCount, setNotifiedCount] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (value) => {
    setFormData((prev) => {
      const current = prev.dietaryInfo || [];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, dietaryInfo: updated };
    });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.foodName) newErrors.foodName = 'Food name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.preparedTime) newErrors.preparedTime = 'Prepared time is required';
    if (!formData.expiryTime) newErrors.expiryTime = 'Expiry time is required';
    
    // Validate expiry time is in future
    const now = new Date();
    const expiryDate = new Date(formData.expiryTime);
    if (expiryDate <= now) {
      newErrors.expiryTime = 'Expiry time must be in the future';
    }
    
    // Validate expiry is after prepared time
    const preparedDate = new Date(formData.preparedTime);
    if (expiryDate <= preparedDate) {
      newErrors.expiryTime = 'Expiry time must be after prepared time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        foodName: formData.foodName,
        category: formData.category,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        preparedTime: formData.preparedTime,
        expiryTime: formData.expiryTime,
        dietaryInfo: formData.dietaryInfo.join(', '),
        description: formData.description,
      };

      // Use new endpoint that returns top 5 organizations with contact info
      const apiResponse = await foodListingService.addFoodListingWithNearby(payload);
      const response = apiResponse?.data || apiResponse;

      const listing = response?.foodListing;
      const nearbyOrgs = response?.nearbyOrganizations;

      const suggested = listing?.suggestedNgos || [];
      const places = nearbyOrgs?.unregisteredNgos || [];
      const top5Registered = nearbyOrgs?.registeredNgos || [];
      const notifiedCount = nearbyOrgs?.notifiedCount || 0;

      // Show SMS notification confirmation
      showSuccess(`Food listing added successfully! 📱 SMS sent to ${notifiedCount} nearby NGOs (top 5).`);

      // Show success modal if we have organizations to show
      if (top5Registered.length > 0 || places.length > 0 || suggested.length > 0) {
        setSuggestedNgos(suggested);
        setNearbyNgoPlaces(places);
        // Store top 5 registered NGOs with contact info
        setTop5RegisteredNgos(top5Registered);
        setNotifiedCount(notifiedCount);
        setShowSuccessModal(true);
      } else {
        handleClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : error?.message || 'Failed to add food listing';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      foodName: '',
      category: '',
      quantity: '',
      unit: 'Servings',
      preparedTime: '',
      expiryTime: '',
      dietaryInfo: [],
      description: '',
    });
    setErrors({});
    setSuggestedNgos([]);
    setNearbyNgoPlaces([]);
    setTop5RegisteredNgos([]);
    setNotifiedCount(0);
    setShowSuccessModal(false);
    onClose();
  };

  const handleSuccessClose = () => {
    handleClose();
    if (onSuccess) onSuccess();
  };

  // Calculate urgency preview
  const getUrgencyPreview = () => {
    if (formData.expiryTime) {
      const urgency = calculateUrgency(formData.expiryTime);
      return (
        <div className="urgency-preview" style={{ borderColor: urgency.color }}>
          <span className="urgency-icon" style={{ color: urgency.color }}>⏰</span>
          <span>This food will expire in: </span>
          <strong style={{ color: urgency.color }}>
            {urgency.minutes < 60 
              ? `${urgency.minutes} minutes` 
              : `${Math.floor(urgency.minutes / 60)} hours ${urgency.minutes % 60} minutes`}
          </strong>
          <span className="urgency-badge" style={{ backgroundColor: urgency.color }}>
            {urgency.level}
          </span>
        </div>
      );
    }
    return null;
  };

  if (showSuccessModal) {
    return (
      <Modal isOpen={isOpen} onClose={handleSuccessClose} title="Food Listed Successfully! 🎉" size="large">
        <div className="success-modal-content">
          <div className="success-icon">✅</div>
          <h3>Your food has been listed!</h3>
          
          {/* SMS Notification Indicator */}
          {notifiedCount > 0 && (
            <div className="sms-notification-indicator">
              <div className="sms-icon">📱</div>
              <div className="sms-info">
                <p className="sms-title">SMS Notifications Sent</p>
                <p className="sms-count">Top {notifiedCount} nearby NGOs notified via SMS</p>
              </div>
              <div className="sms-checkmark">✅</div>
            </div>
          )}
          
          {/* Top 5 Registered NGOs Section */}
          {top5RegisteredNgos.length > 0 && (
            <div className="top5-section">
              <h4 className="section-title">✅ Top 5 Registered NGOs (Notified)</h4>
              <div className="organizations-grid">
                {top5RegisteredNgos.map((ngo, index) => (
                  <div key={ngo.ngoId} className="organization-card registered">
                    <div className="card-header">
                      <span className="rank-badge">#{index + 1}</span>
                      <h5>{ngo.organizationName}</h5>
                      <span className="distance-badge green">{ngo.distanceKm} km</span>
                    </div>
                    <div className="card-body">
                      <div className="contact-info">
                        {ngo.phone && (
                          <div className="contact-item">
                            <span className="icon">📞</span>
                            <span className="value">{ngo.phone}</span>
                          </div>
                        )}
                        {ngo.email && (
                          <div className="contact-item">
                            <span className="icon">📧</span>
                            <span className="value">{ngo.email}</span>
                          </div>
                        )}
                      </div>
                      <p className="address">📍 {ngo.address}</p>
                      <div className="ngo-stats">
                        <span>👥 {ngo.beneficiariesCount} beneficiaries</span>
                        {ngo.dietaryRequirements && (
                          <span>🥗 {ngo.dietaryRequirements}</span>
                        )}
                      </div>
                      {index < notifiedCount && (
                        <div className="notified-badge">✅ SMS Sent</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Unregistered NGOs Section */}
          {nearbyNgoPlaces.length > 0 && (
            <div className="top5-section">
              <h4 className="section-title">📧 Nearby NGOs (Not on Platform)</h4>
              <p className="section-subtitle">These NGOs could benefit from your donations. Invite them to join!</p>
              <div className="organizations-grid">
                {nearbyNgoPlaces.slice(0, 5).map((ngo, index) => (
                  <div key={ngo.placeId || index} className="organization-card unregistered">
                    <div className="card-header">
                      <span className="rank-badge gray">#{index + 1}</span>
                      <h5>{ngo.name}</h5>
                      <span className="distance-badge orange">{ngo.distanceKm} km</span>
                    </div>
                    <div className="card-body">
                      {/* Contact Info from Google Places */}
                      {(ngo.phoneNumber || ngo.website) && (
                        <div className="contact-info">
                          {ngo.phoneNumber && (
                            <div className="contact-item">
                              <span className="icon">📞</span>
                              <span className="value">{ngo.phoneNumber}</span>
                            </div>
                          )}
                          {ngo.website && (
                            <div className="contact-item">
                              <span className="icon">🌐</span>
                              <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="value">
                                Website
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="address">📍 {ngo.vicinity}</p>
                      <div className="not-registered-badge">Not on FeedForward</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Legacy NearbyNgosCard for backward compatibility */}
          {(suggestedNgos.length > 0 || nearbyNgoPlaces.length > 0) && (
            <NearbyNgosCard registeredNgos={suggestedNgos} unregisteredNgos={nearbyNgoPlaces} />
          )}
          
          <Button variant="primary" fullWidth onClick={handleSuccessClose}>
            Got it!
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Surplus Food Listing" size="large">
      <form className="add-food-form" onSubmit={handleSubmit}>
        {/* Food Details Section */}
        <div className="form-section">
          <h3 className="section-title">Food Details</h3>
          
          <div className="form-row">
            <Input
              label="Food Name"
              name="foodName"
              placeholder="e.g., Rice & Dal, Bread Loaves"
              value={formData.foodName}
              onChange={handleChange}
              error={errors.foodName}
              required
            />

            <div className="input-wrapper">
              <label className="input-label">
                Category <span className="input-required">*</span>
              </label>
              <select
                name="category"
                className="input"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {FOOD_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className="input-error-message shake">{errors.category}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <Input
              label="Quantity"
              type="number"
              name="quantity"
              placeholder="50"
              value={formData.quantity}
              onChange={handleChange}
              error={errors.quantity}
              min={1}
              required
            />

            <div className="input-wrapper">
              <label className="input-label">
                Unit <span className="input-required">*</span>
              </label>
              <select
                name="unit"
                className="input"
                value={formData.unit}
                onChange={handleChange}
              >
                {FOOD_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <Input
              label="Prepared Time"
              type="datetime-local"
              name="preparedTime"
              value={formData.preparedTime}
              onChange={handleChange}
              error={errors.preparedTime}
              helperText="When was this food prepared?"
              required
            />

            <Input
              label="Estimated Expiry Time"
              type="datetime-local"
              name="expiryTime"
              value={formData.expiryTime}
              onChange={handleChange}
              error={errors.expiryTime}
              helperText="When will this food expire?"
              required
            />
          </div>

          {getUrgencyPreview()}
        </div>

        {/* Additional Information Section */}
        <div className="form-section">
          <h3 className="section-title">Additional Information</h3>

          <div className="checkbox-group">
            <label className="input-label">Dietary Information</label>
            <div className="checkbox-options">
              {DIETARY_OPTIONS.map((option) => (
                <label key={option.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.dietaryInfo.includes(option.value)}
                    onChange={() => handleCheckboxChange(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="input-wrapper">
            <label className="input-label">Description (Optional)</label>
            <textarea
              name="description"
              className="input textarea"
              placeholder="Additional details about the food..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
              maxLength={500}
            />
            <span className="char-count">
              {formData.description.length}/500 characters
            </span>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="modal-footer">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Add Food Listing
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddFoodModal;


