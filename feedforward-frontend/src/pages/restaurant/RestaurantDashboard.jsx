import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { restaurantService, dashboardService, foodListingService } from '../../services';
import { Button, Card, Loader, Pagination } from '../../components/common';
import AddFoodModal from '../../components/restaurant/AddFoodModal';
import FoodListingsTable from '../../components/restaurant/FoodListingsTable';
import RequestsPanel from '../../components/restaurant/RequestsPanel';
import { FiPlus, FiPackage, FiClock, FiCheckCircle } from 'react-icons/fi';
import './RestaurantDashboard.css';

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeListings: 0,
    pendingRequests: 0,
    totalDonated: 0,
  });
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Pagination state
  const [listingsPage, setListingsPage] = useState(1);
  const [listingsPerPage, setListingsPerPage] = useState(10);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [statsData, listingsData, requestsData] = await Promise.all([
        dashboardService.getRestaurantStats().catch(() => ({ activeListings: 0, pendingRequests: 0, totalDonated: 0 })),
        restaurantService.getMyListings().catch(() => ({ listings: [] })),
        restaurantService.getPendingRequests().catch(() => ({ pendingRequests: [] })),
      ]);

      setStats(statsData);
      setListings(listingsData.listings || []);
      setRequests(requestsData.pendingRequests || []);
    } catch (error) {
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFoodAdded = () => {
    setShowAddModal(false);
    fetchDashboardData();
  };

  const handleDeleteAllActive = async () => {
    const confirmed = window.confirm('Delete ALL active food listings? This will remove them from your Active Listings view.');
    if (!confirmed) return;

    try {
      await foodListingService.deleteAllActiveListings();
      showSuccess('All active listings deleted.');
      setListingsPage(1);
      fetchDashboardData();
    } catch (e) {
      showError(e?.message || 'Failed to delete active listings');
    }
  };

  // Paginated listings
  const paginatedListings = useMemo(() => {
    const start = (listingsPage - 1) * listingsPerPage;
    const end = start + listingsPerPage;
    return listings.slice(start, end);
  }, [listings, listingsPage, listingsPerPage]);

  if (loading) {
    return <Loader fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="restaurant-dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Welcome back, {user?.name || 'Restaurant'} 👋</h1>
            <p className="dashboard-subtitle">Manage your food listings and donation requests</p>
          </div>
          <Button
            variant="primary"
            size="large"
            icon={<FiPlus />}
            onClick={() => setShowAddModal(true)}
          >
            Add Food Listing
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <Card className="stat-card stat-card-primary" hover>
            <div className="stat-icon">
              <FiPackage size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.activeListings || 0}</div>
              <div className="stat-label">Active Listings</div>
            </div>
          </Card>

          <Card className="stat-card stat-card-warning" hover>
            <div className="stat-icon">
              <FiClock size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.pendingRequests || 0}</div>
              <div className="stat-label">Pending Requests</div>
            </div>
          </Card>

          <Card className="stat-card stat-card-success" hover>
            <div className="stat-icon">
              <FiCheckCircle size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalDonated || 0}</div>
              <div className="stat-label">Total Servings Donated</div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          {/* Pending Requests Section */}
          {requests.length > 0 && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Pending Requests</h2>
                <Button variant="link" size="small" onClick={() => navigate('/restaurant/requests')}>
                  View All
                </Button>
              </div>
              <RequestsPanel 
                requests={requests.slice(0, 3)} 
                onUpdate={fetchDashboardData} 
              />
            </div>
          )}

          {/* Food Listings Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Active Food Listings</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Button variant="outline" size="small" onClick={handleDeleteAllActive}>
                  Delete All
                </Button>
                <Button variant="link" size="small" onClick={() => navigate('/restaurant/listings')}>
                  View All
                </Button>
              </div>
            </div>
            {listings.length > 0 ? (
              <>
                <FoodListingsTable 
                  listings={paginatedListings} 
                  onUpdate={fetchDashboardData} 
                />
                {listings.length > listingsPerPage && (
                  <Pagination
                    currentPage={listingsPage}
                    totalPages={Math.ceil(listings.length / listingsPerPage)}
                    totalItems={listings.length}
                    itemsPerPage={listingsPerPage}
                    onPageChange={setListingsPage}
                    onItemsPerPageChange={(value) => {
                      setListingsPerPage(value);
                      setListingsPage(1);
                    }}
                    itemsPerPageOptions={[5, 10, 20, 50]}
                  />
                )}
              </>
            ) : (
              <Card>
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <h3>No active listings</h3>
                  <p>Add your first food listing to get started</p>
                  <Button 
                    variant="primary" 
                    icon={<FiPlus />}
                    onClick={() => setShowAddModal(true)}
                  >
                    Add Food Listing
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Food Modal */}
      <AddFoodModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleFoodAdded}
      />
    </div>
  );
};

export default RestaurantDashboard;
