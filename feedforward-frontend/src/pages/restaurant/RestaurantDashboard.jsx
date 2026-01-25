import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { restaurantService, dashboardService, foodListingService } from '../../services';
import { Button, Card, Skeleton, Pagination } from '../../components/common';
import AddFoodModal from '../../components/restaurant/AddFoodModal';
import FoodListingsTable from '../../components/restaurant/FoodListingsTable';
import RequestsPanel from '../../components/restaurant/RequestsPanel';
import { FiPlus, FiPackage, FiClock, FiCheckCircle } from 'react-icons/fi';
import './RestaurantDashboard.css';

const RestaurantDashboard = () => {
  const { user, loading: authLoading } = useAuth();
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
    
    // Auto-refresh every 15 seconds to get updated request statuses (reduced from 30s for better UX)
    const interval = setInterval(() => {
      if (user && !fetchingRef.current) {
        const now = Date.now();
        if (now - lastFetchTimeRef.current >= FETCH_DEBOUNCE_MS) {
          fetchDashboardData();
        }
      }
    }, 15000); // 15 seconds

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
      console.log('🔄 Fetching dashboard data...');
      // Fetch all data in parallel
      const [statsData, listingsData, requestsData, allRequestsData] = await Promise.all([
        dashboardService.getRestaurantStats().catch((err) => {
          console.error('Error fetching stats:', err);
          return { activeListings: 0, pendingRequests: 0, totalDonated: 0 };
        }),
        restaurantService.getMyListings().catch((err) => {
          console.error('Error fetching listings:', err);
          return { listings: [] };
        }),
        restaurantService.getPendingRequests().catch((err) => {
          console.error('Error fetching pending requests:', err);
          return { pendingRequests: [] };
        }),
        restaurantService.getAllRequests().catch((err) => {
          console.error('Error fetching all requests:', err);
          return { allRequests: [] };
        }),
      ]);

      setStats(statsData);
      setListings(listingsData.listings || []);
      // Show pending requests, but also include approved and picked up for visibility
      const allRequests = allRequestsData.allRequests || [];
      const pendingRequests = requestsData.pendingRequests || [];
      // Combine pending with approved/picked up requests that aren't in pending list
      const approvedAndPickedUp = allRequests.filter(r => 
        (r.status === 'APPROVED' || r.status === 'PICKED_UP') && 
        !pendingRequests.find(p => p.requestId === r.requestId)
      );
      setRequests([...pendingRequests, ...approvedAndPickedUp]);
      console.log('✅ Dashboard data fetched successfully');
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



  // Redirect to auth if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
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
              <div className="stat-number">
                {loading ? <Skeleton width="60px" height="32px" /> : (stats.activeListings || 0)}
              </div>
              <div className="stat-label">Active Listings</div>
            </div>
          </Card>

          <Card className="stat-card stat-card-warning" hover>
            <div className="stat-icon">
              <FiClock size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {loading ? <Skeleton width="60px" height="32px" /> : (stats.pendingRequests || 0)}
              </div>
              <div className="stat-label">Pending Requests</div>
            </div>
          </Card>

          <Card className="stat-card stat-card-success" hover>
            <div className="stat-icon">
              <FiCheckCircle size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {loading ? <Skeleton width="60px" height="32px" /> : (stats.totalDonated || 0)}
              </div>
              <div className="stat-label">Total Servings Donated</div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          {/* Requests Section */}
          {loading ? (
            <div className="dashboard-section">
              <div className="section-header">
                <Skeleton width="180px" height="28px" />
                <Skeleton width="80px" height="20px" />
              </div>
              <Skeleton type="card" height="120px" count={2} style={{ marginBottom: '1rem' }} />
            </div>
          ) : requests.length > 0 && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Food Requests</h2>
                <Button variant="link" size="small" onClick={() => navigate('/restaurant/requests')}>
                  View All
                </Button>
              </div>
              <RequestsPanel 
                requests={requests.slice(0, 5)} 
                onUpdate={fetchDashboardData}
                onRequestUpdate={(requestId, updatedData) => {
                  // Optimistically update requests in parent
                  setRequests(prev => prev.map(req => 
                    req.requestId === requestId 
                      ? { ...req, ...updatedData }
                      : req
                  ));
                  // Update stats if needed
                  if (updatedData.status === 'APPROVED' || updatedData.status === 'REJECTED') {
                    setStats(prev => ({
                      ...prev,
                      pendingRequests: Math.max(0, prev.pendingRequests - 1)
                    }));
                  }
                }}
              />
            </div>
          )}

          {/* Food Listings Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Active Food Listings</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {!loading && (
                  <>
                    <Button variant="outline" size="small" onClick={handleDeleteAllActive}>
                      Delete All
                    </Button>
                    <Button variant="link" size="small" onClick={() => navigate('/restaurant/listings')}>
                      View All
                    </Button>
                  </>
                )}
              </div>
            </div>
            {loading ? (
              <Skeleton type="card" height="300px" />
            ) : listings.length > 0 ? (
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
