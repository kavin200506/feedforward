import api from './api';

const matchingService = {
  /**
   * Get suggested NGOs for a food listing (top 5 matches)
   */
  getSuggestedNgos: async (listingId) => {
    try {
      const response = await api.get(`/match/suggest-ngos/${listingId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get suggested food for NGO (reverse matching)
   */
  getSuggestedFood: async () => {
    try {
      const response = await api.get('/match/suggest-food');
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default matchingService;


