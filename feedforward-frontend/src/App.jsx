import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toast, Navbar, Footer, ErrorBoundary } from './components/common';
import ProtectedRoute from './components/common/ProtectedRoute';
import { USER_ROLES } from './utils/constants';

// Pages
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';

// Restaurant Pages (to be created in next steps)
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import RestaurantListings from './pages/restaurant/RestaurantListings';
import RestaurantRequests from './pages/restaurant/RestaurantRequests';
import RestaurantHistory from './pages/restaurant/RestaurantHistory';

// NGO Pages (to be created in next steps)
import NgoDashboard from './pages/ngo/NgoDashboard';
import BrowseFoodPage from './pages/ngo/BrowseFoodPage';
import NgoRequests from './pages/ngo/NgoRequests';

// Shared Pages (to be created in next steps)
import ImpactPage from './pages/ImpactPage';

import './App.css';

// Component to handle default route based on auth
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

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <Toast />
            <div className="app-wrapper">
              <Navbar />
              <main className="main-content">
                <Routes>
                {/* Public Routes */}
                <Route path="/" element={<DefaultRoute />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/impact" element={<ImpactPage />} />

                {/* Restaurant Routes */}
                <Route
                  path="/restaurant/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.RESTAURANT]}>
                      <RestaurantDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/restaurant/listings"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.RESTAURANT]}>
                      <RestaurantListings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/restaurant/requests"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.RESTAURANT]}>
                      <RestaurantRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/restaurant/history"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.RESTAURANT]}>
                      <RestaurantHistory />
                    </ProtectedRoute>
                  }
                />

                {/* NGO Routes */}
                <Route
                  path="/ngo/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.NGO]}>
                      <NgoDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ngo/browse-food"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.NGO]}>
                      <BrowseFoodPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ngo/requests"
                  element={
                    <ProtectedRoute allowedRoles={[USER_ROLES.NGO]}>
                      <NgoRequests />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Page */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
