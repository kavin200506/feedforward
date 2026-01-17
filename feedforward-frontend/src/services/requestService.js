import axiosInstance from './axiosConfig';

class RequestService {
  // Create request (NGO)
  async createRequest(requestData) {
    try {
      const response = await axiosInstance.post('/requests', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to create request';
    }
  }

  // Get my requests (NGO)
  async getMyRequests() {
    try {
      const response = await axiosInstance.get('/requests/ngo/my-requests');
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get requests';
    }
  }

  // Get active requests (NGO)
  async getActiveRequests() {
    try {
      const response = await axiosInstance.get('/requests/ngo/active');
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get active requests';
    }
  }

  // Get completed requests (NGO)
  async getCompletedRequests() {
    try {
      const response = await axiosInstance.get('/requests/ngo/completed');
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get completed requests';
    }
  }

  // Get pending requests (Restaurant)
  async getPendingRequests() {
    try {
      const response = await axiosInstance.get('/requests/restaurant/pending');
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get pending requests';
    }
  }

  // Get all requests (Restaurant)
  async getAllRestaurantRequests() {
    try {
      const response = await axiosInstance.get('/requests/restaurant/all');
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get all requests';
    }
  }

  // Approve request (Restaurant)
  async approveRequest(requestId, approvalData) {
    try {
      const response = await axiosInstance.post(
        `/requests/${requestId}/approve`,
        approvalData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to approve request';
    }
  }

  // Reject request (Restaurant)
  async rejectRequest(requestId, rejectData) {
    try {
      const response = await axiosInstance.post(
        `/requests/${requestId}/reject`,
        rejectData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to reject request';
    }
  }

  // Mark as picked up (NGO)
  async markAsPickedUp(requestId) {
    try {
      const response = await axiosInstance.patch(`/requests/${requestId}/pickup`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to mark as picked up';
    }
  }

  // Complete donation (NGO)
  async completeDonation(requestId, completionData) {
    try {
      const response = await axiosInstance.post(
        `/requests/${requestId}/complete`,
        completionData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to complete donation';
    }
  }

  // Cancel request (NGO)
  async cancelRequest(requestId) {
    try {
      const response = await axiosInstance.delete(`/requests/${requestId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to cancel request';
    }
  }

  // Get request by ID
  async getRequestById(requestId) {
    try {
      const response = await axiosInstance.get(`/requests/${requestId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get request';
    }
  }
}

export default new RequestService();


