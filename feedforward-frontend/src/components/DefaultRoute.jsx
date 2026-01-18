import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/constants';
import LandingPage from '../pages/LandingPage';

const DefaultRoute = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (isAuthenticated()) {
    if (user?.role === USER_ROLES.RESTAURANT) {
      return <Navigate to="/restaurant/dashboard" replace />;
    } else if (user?.role === USER_ROLES.NGO) {
      return <Navigate to="/ngo/dashboard" replace />;
    }
  }
  
  return <LandingPage />;
};

export default DefaultRoute;

