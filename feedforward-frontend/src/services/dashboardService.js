import axiosInstance from './axiosConfig';

class DashboardService {
  // Get restaurant dashboard
  async getRestaurantDashboard() {
    try {
      const response = await axiosInstance.get('/restaurant/dashboard');
      // Response structure: response.data is ApiResponse, response.data.data is the actual data
      return response.data?.data || response.data || response;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get dashboard';
    }
  }

  // Get restaurant stats (alias for getRestaurantDashboard)
  async getRestaurantStats() {
    try {
      const dashboard = await this.getRestaurantDashboard();
      // Extract stats from dashboard response
      return {
        activeListings: dashboard?.activeListings || 0,
        pendingRequests: dashboard?.pendingRequests || 0,
        totalDonated: dashboard?.totalServingsDonated || 0,
      };
    } catch (error) {
      // Return default stats on error
      return {
        activeListings: 0,
        pendingRequests: 0,
        totalDonated: 0,
      };
    }
  }

  // Get NGO dashboard
  async getNgoDashboard() {
    try {
      const response = await axiosInstance.get('/ngo/dashboard');
      // Response structure: response.data is ApiResponse, response.data.data is the actual data
      return response.data?.data || response.data || response;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get dashboard';
    }
  }

  // Get NGO stats (alias for getNgoDashboard)
  async getNgoStats() {
    try {
      const dashboard = await this.getNgoDashboard();
      // Extract stats from dashboard response
      return {
        activeRequests: dashboard?.activeRequests || 0,
        totalReceived: dashboard?.totalServingsReceived || 0,
        beneficiariesFed: dashboard?.beneficiariesFed || 0,
      };
    } catch (error) {
      // Return default stats on error
      return {
        activeRequests: 0,
        totalReceived: 0,
        beneficiariesFed: 0,
      };
    }
  }

  // Get impact statistics (Public)
  async getImpactStats() {
    try {
      const response = await axiosInstance.get('/impact/stats');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get impact stats';
    }
  }

  // Get restaurant leaderboard
  async getRestaurantLeaderboard() {
    try {
      const response = await axiosInstance.get('/dashboard/leaderboard/restaurants');
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get leaderboard';
    }
  }

  // Get NGO leaderboard
  async getNgoLeaderboard() {
    try {
      const response = await axiosInstance.get('/dashboard/leaderboard/ngos');
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get leaderboard';
    }
  }
}

export default new DashboardService();

