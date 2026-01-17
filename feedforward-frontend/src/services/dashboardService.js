import axiosInstance from './axiosConfig';

class DashboardService {
  // Get restaurant dashboard
  async getRestaurantDashboard() {
    try {
      const response = await axiosInstance.get('/restaurant/dashboard');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get dashboard';
    }
  }

  // Get NGO dashboard
  async getNgoDashboard() {
    try {
      const response = await axiosInstance.get('/ngo/dashboard');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get dashboard';
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

