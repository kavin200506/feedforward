import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ngoService, dashboardService } from '../../services';
import { Button, Card, Loader } from '../../components/common';
import { FiSearch, FiPackage, FiCheckCircle, FiUsers } from 'react-icons/fi';
import './NgoDashboard.css';

const NgoDashboard = () => {
  const { user } = useAuth();
  const { showError } = useNotification();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeRequests: 0,
    totalReceived: 0,
    beneficiariesFed: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [suggestedFood, setSuggestedFood] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, requestsData, foodData] = await Promise.all([
        dashboardService.getNgoStats().catch(() => ({ 
          activeRequests: 0, 
          totalReceived: 0, 
          beneficiariesFed: 0 
        })),
        ngoService.getMyRequests().catch(() => ({ activeRequests: [], completedRequests: [] })),
        ngoService.searchFood({ limit: 6 }).catch(() => ({ foodListings: [] })),
      ]);

      setStats(statsData);
      setRecentRequests(requestsData.activeRequests || []);
      setSuggestedFood(foodData.foodListings || []);
    } catch (error) {
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading dashboard..." />;
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
              <div className="stat-number">{stats.activeRequests || 0}</div>
              <div className="stat-label">Active Requests</div>
            </div>
          </Card>

          <Card className="stat-card stat-card-success" hover>
            <div className="stat-icon">
              <FiCheckCircle size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalReceived || 0}</div>
              <div className="stat-label">Total Servings Received</div>
            </div>
          </Card>

          <Card className="stat-card stat-card-primary" hover>
            <div className="stat-icon">
              <FiUsers size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.beneficiariesFed || 0}</div>
              <div className="stat-label">People Fed This Month</div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          {/* Active Requests Section */}
          {recentRequests.length > 0 && (
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
                          <Button variant="primary" size="small" fullWidth>
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
            {suggestedFood.length > 0 ? (
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
