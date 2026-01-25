import api from './api';

const ngoService = {
  /**
   * Search available food with filters
   */
  searchFood: async (filters = {}) => {
    try {
      // Use POST for search with body, or GET /available for default
      if (Object.keys(filters).length === 0 || filters.limit) {
        // Use GET /available for simple queries
        const response = await api.get('/ngo/available');
        return {
          foodListings: response.data?.data || response.data || response || [],
        };
      } else {
        // Use POST /search for complex queries
        const response = await api.post('/ngo/search', filters);
        return {
          foodListings: response.data?.data || response.data || response || [],
        };
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search available food with nearby unregistered restaurants
   */
  searchFoodWithNearby: async (filters = {}) => {
    try {
      const response = await api.post('/ngo/search-with-nearby', {
        distance: filters.distance || 10,
        category: filters.category ? (Array.isArray(filters.category) ? filters.category[0] : filters.category) : null,
        urgencyLevel: filters.urgency ? (Array.isArray(filters.urgency) ? filters.urgency[0] : filters.urgency) : null,
        searchTerm: filters.search || null,
        sortBy: filters.sortBy || 'expiry',
      });
      return response.data?.data || response.data || {};
    } catch (error) {
      throw error;
    }
  },

  /**
   * Request food from restaurant
   */
  requestFood: async (requestData) => {
    try {
      const response = await api.post('/requests', requestData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all requests (active and completed)
   */
  getMyRequests: async () => {
    try {
      const response = await api.get('/requests/ngo/my-requests');
      // Handle response structure: response.data.data or response.data
      const requests = response.data?.data || response.data || response || [];
      // Separate active and completed requests
      // Active: PENDING, APPROVED, PICKED_UP (anything not COMPLETED or CANCELLED)
      // Completed: COMPLETED
      return {
        activeRequests: requests.filter(r => 
          r.status && 
          r.status !== 'COMPLETED' && 
          r.status !== 'CANCELLED'
        ) || [],
        completedRequests: requests.filter(r => 
          r.status && r.status === 'COMPLETED'
        ) || [],
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark request as picked up
   */
  markAsPickedUp: async (requestId) => {
    try {
      const response = await api.patch(`/requests/${requestId}/pickup`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Complete a request
   */
  completeRequest: async (requestId, quantityReceived) => {
    try {
      const response = await api.post(`/requests/${requestId}/complete`, {
        quantityReceived,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cancel a pending request
   */
  cancelRequest: async (requestId) => {
    try {
      const response = await api.post(`/requests/${requestId}/cancel`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Notify nearby restaurants of urgent need
   */
  notifyNearbyRestaurants: async (requestData) => {
    try {
      const response = await api.post('/ngo/notify-nearby-restaurants', requestData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Rate a restaurant after transaction
   */
  rateRestaurant: async (ratingData) => {
    try {
      const response = await api.post('/ratings', ratingData);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default ngoService;


