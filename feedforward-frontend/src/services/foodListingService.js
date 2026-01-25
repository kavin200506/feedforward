import axiosInstance from './axiosConfig';

class FoodListingService {
  // Add food listing (Restaurant)
  async addFoodListing(listingData) {
    try {
      const response = await axiosInstance.post('/restaurant/listings', listingData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to add food listing';
    }
  }

  // Add food listing with top 5 nearby organizations
  async addFoodListingWithNearby(listingData) {
    try {
      const response = await axiosInstance.post('/restaurant/listings/with-nearby', listingData);
      // axiosInstance returns { data: ApiResponse }
      // ApiResponse structure: { success, message, data: FoodListingWithNearbyResponse, timestamp }
      // Return the inner data field which contains FoodListingWithNearbyResponse
      if (response.data && response.data.data) {
        return response.data.data;
      }
      // Fallback: return the whole response if structure is different
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to add food listing';
      console.error('Error adding food listing:', error);
      throw new Error(errorMessage);
    }
  }

  // Get my listings (Restaurant)
  async getMyListings() {
    try {
      const response = await axiosInstance.get('/restaurant/listings');
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get listings';
    }
  }

  // Get active listings (Restaurant)
  async getActiveListings() {
    try {
      const response = await axiosInstance.get('/restaurant/listings/active');
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get active listings';
    }
  }

  // Delete ALL active listings (Restaurant) - soft delete
  async deleteAllActiveListings() {
    try {
      const response = await axiosInstance.delete('/restaurant/listings/active');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to delete active listings';
    }
  }

  // Search available food (NGO)
  async searchAvailableFood(searchParams) {
    try {
      const response = await axiosInstance.post('/ngo/search', searchParams);
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to search food';
    }
  }

  // Get listing by ID
  async getListingById(id) {
    try {
      const response = await axiosInstance.get(`/restaurant/listings/${id}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get listing';
    }
  }

  // Delete listing
  async deleteListing(id) {
    try {
      const response = await axiosInstance.delete(`/restaurant/listings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to delete listing';
    }
  }
}

export default new FoodListingService();


