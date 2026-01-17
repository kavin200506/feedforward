import axiosInstance from './axiosConfig';

class AuthService {
  // Register
  async register(userData) {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      
      if (response.data && response.data.success) {
        const authData = response.data.data; // AuthResponse object
        const { token, ...userProfile } = authData;
        
        // Save to localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        // Extract organization name from profile if available
        const organizationName = authData.profile?.organizationName || 
                                 authData.organizationName || 
                                 userProfile.name;
        
        localStorage.setItem('user', JSON.stringify({
          userId: authData.userId,
          name: authData.name,
          role: authData.role,
          organizationName: organizationName,
        }));
        
        return response.data;
      }
      
      throw new Error(response.data?.message || 'Registration failed');
    } catch (error) {
      // Handle validation errors and other API errors
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Registration failed';
      throw new Error(errorMessage);
    }
  }

  // Login
  async login(email, password) {
    try {
      // Development mode: Mock login for testing without backend
      const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_AUTH === 'true';
      
      if (isDevelopment) {
        // Mock login for development
        const mockUsers = {
          'restaurant@test.com': {
            userId: 'rest-001',
            name: 'Test Restaurant',
            role: 'RESTAURANT',
            organizationName: 'Test Restaurant',
            token: 'mock-token-restaurant-123',
          },
          'ngo@test.com': {
            userId: 'ngo-001',
            name: 'Test NGO',
            role: 'NGO',
            organizationName: 'Test NGO Shelter',
            token: 'mock-token-ngo-123',
          },
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockUser = mockUsers[email.toLowerCase()];
        
        if (mockUser && password === 'password123') {
          localStorage.setItem('authToken', mockUser.token);
          const user = {
            userId: mockUser.userId,
            name: mockUser.name,
            role: mockUser.role,
            organizationName: mockUser.organizationName,
          };
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('userProfile', JSON.stringify(user));
          return { success: true, data: { ...mockUser }, message: 'Login successful (Development Mode)' };
        } else {
          throw new Error('Invalid credentials. Use: restaurant@test.com or ngo@test.com with password: password123');
        }
      }

      // Production: Real API call
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      
      if (response.data.success) {
        const { token, ...userProfile } = response.data.data;
        
        // Save to localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        localStorage.setItem('user', JSON.stringify({
          userId: userProfile.userId,
          name: userProfile.name,
          role: userProfile.role,
          organizationName: userProfile.profile?.organizationName || userProfile.name,
        }));
        
        return response.data;
      }
      
      throw new Error(response.data.message);
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Login failed';
    }
  }

  // Get Profile
  async getProfile() {
    try {
      const response = await axiosInstance.get('/auth/profile');
      
      if (response.data.success) {
        localStorage.setItem('userProfile', JSON.stringify(response.data.data));
        return response.data.data;
      }
      
      throw new Error(response.data.message);
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get profile';
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  // Get current user
  getCurrentUser() {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      try {
        return JSON.parse(userProfile);
      } catch (error) {
        return null;
      }
    }
    // Fallback to old 'user' key for backward compatibility
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  }
}

export default new AuthService();

