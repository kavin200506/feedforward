import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Footer } from './components/common';
import Navbar from './components/common/Navbar';
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

// Route Components
import DefaultRoute from './components/DefaultRoute';

import './App.css';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
