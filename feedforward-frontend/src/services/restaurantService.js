import api from './api';

const restaurantService = {
  /**
   * Add a new food listing
   */
  addFoodListing: async (listingData) => {
    try {
      const response = await api.post('/restaurants/food-listings', listingData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all food listings for the restaurant
   */
  getMyListings: async () => {
    try {
      const response = await api.get('/restaurant/listings');
      // Handle response structure: response.data.data or response.data
      return {
        listings: response.data?.data || response.data || response || [],
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get pending requests from NGOs
   */
  getPendingRequests: async () => {
    try {
      const response = await api.get('/requests/restaurant/pending');
      // Handle response structure: response.data.data or response.data
      return {
        pendingRequests: response.data?.data || response.data || response || [],
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all requests for restaurant (including approved, picked up, etc.)
   */
  getAllRequests: async () => {
    try {
      const response = await api.get('/requests/restaurant/all');
      // Handle response structure: response.data.data or response.data
      return {
        allRequests: response.data?.data || response.data || response || [],
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Approve a food request from NGO
   * @param {number} requestId - The request ID
   * @param {string} response - Response message from restaurant
   * @param {string} pickupTime - Pickup time in ISO format (e.g., "2024-01-25T14:00:00")
   */
  approveRequest: async (requestId, response, pickupTime) => {
    try {
      const responseData = await api.post(`/requests/${requestId}/approve`, {
        response: response || 'Request approved. Please pick up at the specified time.',
        pickupTime: pickupTime,
      });
      return responseData;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reject a food request from NGO
   * @param {number} requestId - The request ID
   * @param {string} reason - Reason for rejection
   */
  rejectRequest: async (requestId, reason) => {
    try {
      const response = await api.post(`/requests/${requestId}/reject`, {
        reason: reason || 'Request rejected',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update food listing
   */
  updateListing: async (listingId, updateData) => {
    try {
      const response = await api.put(`/restaurants/food-listings/${listingId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete food listing
   */
  deleteListing: async (listingId) => {
    try {
      const response = await api.delete(`/restaurants/food-listings/${listingId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get donation history
   */
  getDonationHistory: async (filters) => {
    try {
      const response = await api.get('/restaurants/history', { params: filters });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default restaurantService;


