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
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to add food listing';
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


