import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ngoService, dashboardService } from '../../services';
import { Button, Card, Skeleton } from '../../components/common';
import { FiSearch, FiPackage, FiCheckCircle, FiUsers } from 'react-icons/fi';
import './NgoDashboard.css';

const NgoDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeRequests: 0,
    totalReceived: 0,
    beneficiariesFed: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [suggestedFood, setSuggestedFood] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prevent duplicate API calls
  const fetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const FETCH_DEBOUNCE_MS = 1000; // Don't fetch more than once per second

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!user) {
      setLoading(false);
      return;
    }

    // Prevent duplicate calls
    const now = Date.now();
    if (fetchingRef.current || (now - lastFetchTimeRef.current < FETCH_DEBOUNCE_MS)) {
      return;
    }

    fetchDashboardData();
    
    // Auto-refresh every 30 seconds to get updated request statuses
    const interval = setInterval(() => {
      if (user && !fetchingRef.current) {
        const now = Date.now();
        if (now - lastFetchTimeRef.current >= FETCH_DEBOUNCE_MS) {
          fetchDashboardData();
        }
      }
    }, 30000); // 30 seconds

    // Refresh when window comes into focus (debounced)
    const handleFocus = () => {
      if (user && !fetchingRef.current) {
        const now = Date.now();
        if (now - lastFetchTimeRef.current >= FETCH_DEBOUNCE_MS) {
          fetchDashboardData();
        }
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const fetchDashboardData = async () => {
    // Prevent duplicate calls
    if (fetchingRef.current) {
      console.log('⏸️ Dashboard fetch already in progress, skipping...');
      return;
    }

    const now = Date.now();
    if (now - lastFetchTimeRef.current < FETCH_DEBOUNCE_MS) {
      console.log('⏸️ Dashboard fetch debounced, skipping...');
      return;
    }

    fetchingRef.current = true;
    lastFetchTimeRef.current = now;
    setLoading(true);

    try {
      console.log('🔄 Fetching NGO dashboard data...');
      const [statsData, requestsData, foodData] = await Promise.all([
        dashboardService.getNgoStats().catch((err) => {
          console.error('Error fetching NGO stats:', err);
          return { 
            activeRequests: 0, 
            totalReceived: 0, 
            beneficiariesFed: 0 
          };
        }),
        ngoService.getMyRequests().catch((err) => {
          console.error('Error fetching requests:', err);
          return { activeRequests: [], completedRequests: [] };
        }),
        ngoService.searchFood({ limit: 6 }).catch((err) => {
          console.error('Error searching food:', err);
          return { foodListings: [] };
        }),
      ]);

      setStats(statsData);
      setRecentRequests(requestsData.activeRequests || []);
      setSuggestedFood(foodData.foodListings || []);
      console.log('✅ NGO dashboard data fetched successfully');
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      // Don't show error if it's a 401 (will be handled by interceptor)
      if (error?.status !== 401) {
        showError(error?.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

<<<<<<< HEAD
  // if (loading) {
  //   return <Loader fullScreen text="Loading dashboard..." />;
  // }
=======
  const handleMarkPickedUp = async (requestId) => {
    try {
      console.log('Marking request as picked up:', requestId);
      const response = await ngoService.markAsPickedUp(requestId);
      console.log('Mark as picked up response:', response);
      
      // Optimistically update the UI immediately
      setRecentRequests(prev => prev.map(req => 
        req.requestId === requestId 
          ? { ...req, status: 'PICKED_UP', pickedUpAt: new Date().toISOString() }
          : req
      ));
      
      showSuccess('Marked as picked up!');
      // Refresh to get latest data from server
      await fetchDashboardData();
    } catch (error) {
      const errorMessage = error?.message || 
                          error?.response?.data?.message || 
                          error?.data?.message ||
                          'Failed to update status';
      console.error('Mark as picked up error:', error);
      showError(errorMessage);
      // Refresh to get correct state from server
      await fetchDashboardData();
    }
  };

  // Show loading if auth is loading or dashboard is loading
  if (authLoading || loading) {
    return <Loader fullScreen text="Loading dashboard..." />;
  }
>>>>>>> d93193f56c4d0ff85a2c08d1bdd7290b00650733

  // Redirect to auth if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="ngo-dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Welcome, {user?.name || 'NGO'} 🤝</h1>
            <p className="dashboard-subtitle">Discover available food and manage your requests</p>
          </div>
          <Button
            variant="primary"
            size="large"
            icon={<FiSearch />}
            onClick={() => navigate('/ngo/browse-food')}
          >
            Browse Food
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <Card className="stat-card stat-card-warning" hover>
            <div className="stat-icon">
              <FiPackage size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {loading ? <Skeleton width="60px" height="32px" /> : (stats.activeRequests || 0)}
              </div>
              <div className="stat-label">Active Requests</div>
            </div>
          </Card>

          <Card className="stat-card stat-card-success" hover>
            <div className="stat-icon">
              <FiCheckCircle size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {loading ? <Skeleton width="60px" height="32px" /> : (stats.totalReceived || 0)}
              </div>
              <div className="stat-label">Total Servings Received</div>
            </div>
          </Card>

          <Card className="stat-card stat-card-primary" hover>
            <div className="stat-icon">
              <FiUsers size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {loading ? <Skeleton width="60px" height="32px" /> : (stats.beneficiariesFed || 0)}
              </div>
              <div className="stat-label">People Fed This Month</div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          {/* Active Requests Section */}
          {loading ? (
            <div className="dashboard-section">
              <div className="section-header">
                <Skeleton width="180px" height="28px" />
                <Skeleton width="80px" height="20px" />
              </div>
              <div className="requests-grid">
                 <Skeleton type="card" height="150px" count={3} />
              </div>
            </div>
          ) : recentRequests.length > 0 && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Active Requests</h2>
                <Button variant="link" size="small" onClick={() => navigate('/ngo/requests')}>
                  View All
                </Button>
              </div>
              <div className="requests-grid">
                {recentRequests.slice(0, 3).map((request) => (
                  <Card key={request.requestId} className="request-card">
                    <div className="request-status-badge" data-status={request.status}>
                      {request.status}
                    </div>
                    <h4 className="request-food-name">{request.foodName}</h4>
                    <p className="request-restaurant">from {request.restaurantName}</p>
                    <div className="request-info">
                      <div className="info-item">
                        <span className="info-label">Quantity:</span>
                        <span className="info-value">{request.quantityRequested} servings</span>
                      </div>
                      {request.status === 'APPROVED' && (
                        <>
                          <div className="info-item">
                            <span className="info-label">Pickup:</span>
                            <span className="info-value">{request.pickupTime}</span>
                          </div>
                          <Button 
                            variant="primary" 
                            size="small" 
                            fullWidth
                            onClick={() => handleMarkPickedUp(request.requestId)}
                          >
                            Mark as Picked Up
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Available Food Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Available Food Near You</h2>
              <Button variant="link" size="small" onClick={() => navigate('/ngo/browse-food')}>
                Browse All
              </Button>
            </div>
            {loading ? (
              <div className="food-grid">
                 <Skeleton type="card" height="180px" count={3} />
                 <Skeleton type="card" height="180px" count={3} />
              </div>
            ) : suggestedFood.length > 0 ? (
              <div className="food-grid">
                {suggestedFood.map((food) => (
                  <Card key={food.listingId} className="food-card-mini" hover>
                    <div className="food-card-header">
                      <div className="food-category-icon">{food.categoryEmoji || '🍽️'}</div>
                      <div className="urgency-indicator" style={{ backgroundColor: food.urgencyColor }}>
                        {food.timeRemaining}
                      </div>
                    </div>
                    <h4 className="food-name">{food.foodName}</h4>
                    <p className="food-restaurant">{food.restaurantName}</p>
                    <div className="food-meta">
                      <span>📦 {food.quantity} {food.unit}</span>
                      <span>📍 {food.distance} km</span>
                    </div>
                    <Button 
                      variant="primary" 
                      size="small" 
                      fullWidth
                      onClick={() => navigate('/ngo/browse-food')}
                    >
                      Request Food
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No food available right now</h3>
                  <p>Check back later or adjust your search preferences</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NgoDashboard;
