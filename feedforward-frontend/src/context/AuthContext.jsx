import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on component mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      if (response && response.success && response.data) {
        const authData = response.data; // AuthResponse object
        const profile = authData.profile; // UserProfileResponse object
        
        // Build user object from response
        const user = {
          userId: authData.userId,
          name: authData.name,
          role: authData.role,
          organizationName: profile?.organizationName || authData.name,
        };
        
        setUser(user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      if (response && response.success) {
        // Handle different response structures
        const authData = response.data || response;
        const profile = authData.profile || authData;
        
        // Build user object from response
        const user = {
          userId: authData.userId || profile.userId,
          name: authData.name || profile.name,
          role: authData.role || profile.role,
          organizationName: profile?.organizationName || authData.organizationName || authData.name || profile.name,
        };
        
        setUser(user);
      }
      
      return response;
    } catch (error) {
      // Re-throw with proper error message
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

