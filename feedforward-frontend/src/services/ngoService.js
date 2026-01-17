import api from './api';

const ngoService = {
  /**
   * Search available food with filters
   */
  searchFood: async (filters = {}) => {
    try {
      const response = await api.get('/ngos/search-food', { params: filters });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Request food from restaurant
   */
  requestFood: async (requestData) => {
    try {
      const response = await api.post('/ngos/requests', requestData);
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
      const response = await api.get('/ngos/my-requests');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark request as picked up
   */
  markAsPickedUp: async (requestId) => {
    try {
      const response = await api.post(`/requests/${requestId}/pickup`);
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


