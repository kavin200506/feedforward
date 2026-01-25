import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../common';
import { FiPhone, FiMapPin, FiMail, FiSend } from 'react-icons/fi';
import { useNotification } from '../../context/NotificationContext';
import { ngoService } from '../../services';
import './NearbyRestaurantsPanel.css';

const NearbyRestaurantsPanel = () => {
  const { showSuccess, showError } = useNotification();
  const [registeredRestaurants, setRegisteredRestaurants] = useState([]);
  const [unregisteredRestaurants, setUnregisteredRestaurants] = useState([]);
  const [notifiedCount, setNotifiedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [quantityNeeded, setQuantityNeeded] = useState('');
  const [foodPreference, setFoodPreference] = useState('ALL');

  const fetchNearbyRestaurants = async () => {
    if (!quantityNeeded || quantityNeeded <= 0) {
      showError('Please enter a valid quantity needed');
      return;
    }

    setLoading(true);
    try {
      const response = await ngoService.notifyNearbyRestaurants({
        quantityNeeded: parseInt(quantityNeeded),
        foodPreference: foodPreference
      });

      const data = response?.data || response;
      const registered = data?.registeredRestaurants || [];
      const unregistered = data?.unregisteredRestaurants || [];
      const notified = data?.notifiedCount || 0;

      setRegisteredRestaurants(registered);
      setUnregisteredRestaurants(unregistered);
      setNotifiedCount(notified);
      setShowPanel(true);

      if (notified > 0) {
        showSuccess(`SMS sent to ${notified} nearby registered restaurants!`);
      } else {
        showSuccess('Nearby restaurants loaded. No registered restaurants found to notify.');
      }
    } catch (error) {
      const errorMessage = error?.message || 
                          error?.response?.data?.message || 
                          error?.data?.message ||
                          'Failed to fetch nearby restaurants';
      showError(errorMessage);
      console.error('Error fetching nearby restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nearby-restaurants-panel">
      <Card className="nearby-restaurants-card">
        <div className="panel-header">
          <h3>📍 Find Nearby Restaurants</h3>
          <p className="panel-subtitle">Get nearby restaurants and notify them of your food needs</p>
        </div>

        <div className="request-form">
          <div className="form-row">
            <div className="form-group">
              <label>Quantity Needed (servings)</label>
              <input
                type="number"
                min="1"
                value={quantityNeeded}
                onChange={(e) => setQuantityNeeded(e.target.value)}
                placeholder="e.g., 50"
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Food Preference</label>
              <select
                value={foodPreference}
                onChange={(e) => setFoodPreference(e.target.value)}
                className="input"
              >
                <option value="ALL">All Types</option>
                <option value="VEGETARIAN">Vegetarian</option>
                <option value="NON_VEG">Non-Vegetarian</option>
              </select>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={fetchNearbyRestaurants}
            disabled={loading || !quantityNeeded || quantityNeeded <= 0}
            fullWidth
          >
            {loading ? 'Loading...' : 'Find & Notify Restaurants'}
          </Button>
        </div>

        {showPanel && (
          <>
            {/* SMS Notification Indicator */}
            {notifiedCount > 0 && (
              <div className="sms-notification-indicator">
                <div className="sms-icon">📱</div>
                <div className="sms-info">
                  <p className="sms-title">SMS Notifications Sent</p>
                  <p className="sms-count">Top {notifiedCount} nearby registered restaurants notified via SMS</p>
                </div>
                <div className="sms-checkmark">✅</div>
              </div>
            )}

            {/* Registered Restaurants Section */}
            {registeredRestaurants.length > 0 ? (
              <div className="restaurants-section">
                <h4 className="section-title">
                  ✅ Registered Restaurants (Notified) ({registeredRestaurants.length})
                </h4>
                <div className="restaurants-grid">
                  {registeredRestaurants.map((restaurant, index) => (
                    <div key={restaurant.restaurantId} className="restaurant-card registered">
                      <div className="card-header">
                        <span className="rank-badge">#{index + 1}</span>
                        <h5>{restaurant.organizationName}</h5>
                        <span className="distance-badge green">{restaurant.distanceKm} km</span>
                      </div>
                      <div className="card-body">
                        <div className="contact-info">
                          {restaurant.phone && (
                            <div className="contact-item">
                              <FiPhone className="icon" />
                              <span className="value">{restaurant.phone}</span>
                            </div>
                          )}
                          {restaurant.email && (
                            <div className="contact-item">
                              <FiMail className="icon" />
                              <span className="value">{restaurant.email}</span>
                            </div>
                          )}
                        </div>
                        <p className="address">
                          <FiMapPin className="icon" />
                          {restaurant.address}
                        </p>
                        {restaurant.cuisineType && (
                          <div className="cuisine-badge">{restaurant.cuisineType}</div>
                        )}
                        {index < notifiedCount && (
                          <div className="notified-badge">✅ SMS Sent</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="restaurants-section">
                <p className="no-data-message">No registered restaurants found nearby within 10 km radius.</p>
              </div>
            )}

            {/* Unregistered Restaurants Section */}
            {unregisteredRestaurants.length > 0 && (
              <div className="restaurants-section">
                <h4 className="section-title">
                  📧 Nearby Restaurants (Not on Platform) ({unregisteredRestaurants.length})
                </h4>
                <p className="section-subtitle">
                  These restaurants could help with your food needs. Contact them directly!
                </p>
                <div className="restaurants-grid">
                  {unregisteredRestaurants.map((restaurant, index) => (
                    <div key={restaurant.placeId || index} className="restaurant-card unregistered">
                      <div className="card-header">
                        <span className="rank-badge gray">#{index + 1}</span>
                        <h5>{restaurant.name}</h5>
                        <span className="distance-badge orange">{restaurant.distanceKm} km</span>
                      </div>
                      <div className="card-body">
                        {/* Contact Info from Google Places */}
                        {(restaurant.phoneNumber || restaurant.website) && (
                          <div className="contact-info">
                            {restaurant.phoneNumber && (
                              <div className="contact-item">
                                <FiPhone className="icon" />
                                <a href={`tel:${restaurant.phoneNumber}`} className="value">
                                  {restaurant.phoneNumber}
                                </a>
                              </div>
                            )}
                            {restaurant.website && (
                              <div className="contact-item">
                                <span className="icon">🌐</span>
                                <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="value">
                                  Website
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="address">
                          <FiMapPin className="icon" />
                          {restaurant.address}
                        </p>
                        {restaurant.rating && (
                          <div className="rating-badge">⭐ {restaurant.rating}</div>
                        )}
                        {restaurant.mapsUrl && (
                          <a
                            href={restaurant.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="maps-link"
                          >
                            View on Google Maps
                          </a>
                        )}
                        <div className="not-registered-badge">Not on FeedForward</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default NearbyRestaurantsPanel;

