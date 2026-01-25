import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { restaurantService, foodListingService } from '../../services';
import { Button, Card, Skeleton, Pagination } from '../../components/common';
import FoodListingsTable from '../../components/restaurant/FoodListingsTable';
import './RestaurantDashboard.css';

const RestaurantListings = () => {
  const { user, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useNotification();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

    fetchListings();
    
    // Auto-refresh every 15 seconds to get updated listing statuses
    const interval = setInterval(() => {
      if (user && !fetchingRef.current) {
        const now = Date.now();
        if (now - lastFetchTimeRef.current >= FETCH_DEBOUNCE_MS) {
          fetchListings();
        }
      }
    }, 15000); // 15 seconds

    // Refresh when window comes into focus (debounced)
    const handleFocus = () => {
      if (user && !fetchingRef.current) {
        const now = Date.now();
        if (now - lastFetchTimeRef.current >= FETCH_DEBOUNCE_MS) {
          fetchListings();
        }
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const fetchListings = async () => {
    // Prevent duplicate calls
    if (fetchingRef.current) {
      console.log('⏸️ Listings fetch already in progress, skipping...');
      return;
    }

    const now = Date.now();
    if (now - lastFetchTimeRef.current < FETCH_DEBOUNCE_MS) {
      console.log('⏸️ Listings fetch debounced, skipping...');
      return;
    }

    fetchingRef.current = true;
    lastFetchTimeRef.current = now;
    setLoading(true);

    try {
      console.log('🔄 Fetching listings...');
      const listingsData = await restaurantService.getMyListings();
      setListings(listingsData.listings || []);
      console.log('✅ Listings fetched successfully');
    } catch (error) {
      console.error('Listings fetch error:', error);
      // Don't show error if it's a 401 (will be handled by interceptor)
      if (error?.status !== 401) {
        showError(error?.message || 'Failed to load listings');
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  const handleDeleteAllActive = async () => {
    const confirmed = window.confirm('Delete ALL active food listings? This will remove them from your Active Listings view.');
    if (!confirmed) return;

    try {
      await foodListingService.deleteAllActiveListings();
      showSuccess('All active listings deleted.');
      setListingsPage(1);
      fetchListings();
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
  if (authLoading) {
    return <div className="container"><Skeleton type="card" height="400px" /></div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="restaurant-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>My Food Listings</h1>
        </div>

        {/* Food Listings Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: 'auto' }}>
              {!loading && (
                <>
                  <Button variant="outline" size="small" onClick={handleDeleteAllActive}>
                    Delete All
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
                onUpdate={fetchListings} 
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
                <p>You haven't created any food listings yet. Add your first listing to start donating!</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantListings;
