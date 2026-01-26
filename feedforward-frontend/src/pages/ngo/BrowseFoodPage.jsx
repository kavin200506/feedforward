import React, { useState, useEffect, useMemo } from 'react';
import { ngoService } from '../../services';
import { useNotification } from '../../context/NotificationContext';
import { Skeleton, Button, Pagination } from '../../components/common';
import FilterSidebar from '../../components/ngo/FilterSidebar';
import FoodCard from '../../components/ngo/FoodCard';
import RequestFoodModal from '../../components/ngo/RequestFoodModal';
import CustomRequestModal from '../../components/ngo/CustomRequestModal';
import { SORT_OPTIONS } from '../../utils/constants';
import { useDebounce } from '../../hooks';
import { FiFilter } from 'react-icons/fi';
import './BrowseFoodPage.css';

const BrowseFoodPage = () => {
  const { showError } = useNotification();

  const [foodListings, setFoodListings] = useState([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [myRequests, setMyRequests] = useState([]); // Store NGO's requests to filter out
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    distance: 10,
    category: [],
    dietaryType: '', // Required - single choice
    allergens: [], // Optional - multi-select
    urgency: [],
    sortBy: 'expiry',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showCustomRequestModal, setShowCustomRequestModal] = useState(false);
  
  // Pagination state
  const [foodListingsPage, setFoodListingsPage] = useState(1);
  const [restaurantsPage, setRestaurantsPage] = useState(1);
  const [foodListingsPerPage, setFoodListingsPerPage] = useState(12);
  const [restaurantsPerPage, setRestaurantsPerPage] = useState(12);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  useEffect(() => {
    fetchFoodListings();
  }, [filters, debouncedSearch]);

  const fetchMyRequests = async () => {
    try {
      const requests = await ngoService.getMyRequests();
      // Get all listing IDs that have been requested (any status except CANCELLED)
      const requestedListingIds = [
        ...(requests.activeRequests || []),
        ...(requests.completedRequests || [])
      ]
        .filter(req => req.status !== 'CANCELLED')
        .map(req => req.listingId);
      setMyRequests(requestedListingIds);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      // Don't show error, just continue without filtering
    }
  };

  const fetchFoodListings = async () => {
    setLoading(true);
    try {
      // Format dietary info: combine dietary type and allergens
      const dietaryInfoParts = [];
      if (filters.dietaryType) {
        dietaryInfoParts.push(filters.dietaryType);
      }
      if (filters.allergens && filters.allergens.length > 0) {
        dietaryInfoParts.push(...filters.allergens);
      }

      const params = {
        distance: filters.distance,
        category: filters.category.length > 0 ? filters.category[0] : null,
        dietaryInfo: dietaryInfoParts.join(','),
        sortBy: filters.sortBy,
        search: debouncedSearch,
      };

      // Use new endpoint that includes nearby restaurants
      const response = await ngoService.searchFoodWithNearby(params);
      const allListings = response.registeredResults || [];
      
      // Filter out listings that the NGO has already requested
      const filteredListings = allListings.filter(
        listing => !myRequests.includes(listing.listingId)
      );
      
      setFoodListings(filteredListings);
      setNearbyRestaurants(response.nearbyRestaurants || []);
    } catch (error) {
      console.error('Failed to load food listings (primary endpoint):', error);
      // Fallback to old endpoint if new one fails
      try {
        // Format dietary info for fallback
        const fallbackDietaryParts = [];
        if (filters.dietaryType) {
          fallbackDietaryParts.push(filters.dietaryType);
        }
        if (filters.allergens && filters.allergens.length > 0) {
          fallbackDietaryParts.push(...filters.allergens);
        }

        const fallbackParams = {
          distance: filters.distance,
          category: filters.category.join(','),
          dietaryInfo: fallbackDietaryParts.join(','),
          sortBy: filters.sortBy,
          search: debouncedSearch,
        };
        const fallbackResponse = await ngoService.searchFood(fallbackParams);
        const allListings = fallbackResponse.foodListings || [];
        
        // Filter out listings that the NGO has already requested
        const filteredListings = allListings.filter(
          listing => !myRequests.includes(listing.listingId)
        );
        
        setFoodListings(filteredListings);
        setNearbyRestaurants([]);
      } catch (fallbackError) {
        console.error('Failed to load food listings (fallback endpoint):', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleRequestFood = (food) => {
    setSelectedFood(food);
    setShowRequestModal(true);
  };

  const handleRequestSuccess = (quantityRequested) => {
    setShowRequestModal(false);
    // Add the listing ID to myRequests to filter it out
    if (selectedFood && quantityRequested) {
      setMyRequests(prev => [...prev, selectedFood.listingId]);
      
      // Optimistically update the food listing quantity
      setFoodListings(prev => prev.map(food => 
        food.listingId === selectedFood.listingId
          ? { ...food, quantity: Math.max(0, food.quantity - quantityRequested), hasRequested: true }
          : food
      ));
    }
    setSelectedFood(null);
    // Refresh requests and food listings after a short delay
    setTimeout(() => {
      fetchMyRequests();
      fetchFoodListings();
    }, 1000);
  };

  // Paginated food listings
  const paginatedFoodListings = useMemo(() => {
    const start = (foodListingsPage - 1) * foodListingsPerPage;
    const end = start + foodListingsPerPage;
    return foodListings.slice(start, end);
  }, [foodListings, foodListingsPage, foodListingsPerPage]);

  // Paginated restaurants
  const paginatedRestaurants = useMemo(() => {
    const start = (restaurantsPage - 1) * restaurantsPerPage;
    const end = start + restaurantsPerPage;
    return nearbyRestaurants.slice(start, end);
  }, [nearbyRestaurants, restaurantsPage, restaurantsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setFoodListingsPage(1);
    setRestaurantsPage(1);
  }, [filters, debouncedSearch]);

  return (
    <div className="browse-food-page">
      <div className="container-full">
        <div className="browse-layout">
          {/* Filter Sidebar - Desktop */}
          <aside className="filter-sidebar-wrapper desktop-only">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </aside>

          {/* Main Content */}
          <main className="browse-content">
            {/* Header */}
            <div className="browse-header">
              <div>
                <h1 className="browse-title">Browse Available Food</h1>
                <p className="browse-subtitle">
                  {loading ? 'Loading...' : `${foodListings.length} food listings available`}
                </p>
              </div>

              {/* Mobile Filter Toggle */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="secondary" onClick={() => setShowCustomRequestModal(true)}>
                  Request Item
                </Button>
                <Button
                  variant="outline"
                  icon={<FiFilter />}
                  className="mobile-filter-toggle"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                >
                  Filters
                </Button>
              </div>
            </div>

            {/* Sort Bar */}
            <div className="sort-bar">
              <div className="sort-group">
                <label htmlFor="sort-select">Sort by:</label>
                <select
                  id="sort-select"
                  className="sort-select"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Registered Food Listings Section */}
            {loading ? (
              <div className="results-section">
                <Skeleton width="300px" height="32px" style={{ marginBottom: '1.5rem' }} />
                <div className="food-grid">
                  <Skeleton type="card" height="380px" count={6} />
                </div>
                
                <div style={{ marginTop: '3rem' }}>
                  <Skeleton width="300px" height="32px" style={{ marginBottom: '1.5rem' }} />
                  <div className="food-grid">
                    <Skeleton type="card" height="200px" count={3} />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {foodListings.length > 0 && (
                  <div className="results-section">
                    <h2 className="section-title">
                      ✅ Food Available Now ({foodListings.length})
                    </h2>
                    <div className="food-grid">
                      {paginatedFoodListings.map((food) => (
                        <FoodCard
                          key={food.listingId}
                          food={food}
                          onRequest={handleRequestFood}
                        />
                      ))}
                    </div>
                    {foodListings.length > foodListingsPerPage && (
                      <Pagination
                        currentPage={foodListingsPage}
                        totalPages={Math.ceil(foodListings.length / foodListingsPerPage)}
                        totalItems={foodListings.length}
                        itemsPerPage={foodListingsPerPage}
                        onPageChange={setFoodListingsPage}
                        onItemsPerPageChange={(value) => {
                          setFoodListingsPerPage(value);
                          setFoodListingsPage(1);
                        }}
                        itemsPerPageOptions={[6, 12, 24, 48]}
                      />
                    )}
                  </div>
                )}

                {/* Nearby Unregistered Restaurants Section */}
                {nearbyRestaurants.length > 0 && (
                  <div className="results-section nearby-section">
                    <h2 className="section-title">
                      📍 Restaurants Near You ({nearbyRestaurants.length})
                    </h2>
                    <p className="section-subtitle">
                      These restaurants are nearby but not yet on FeedForward
                    </p>
                    <div className="food-grid">
                      {paginatedRestaurants.map((restaurant, index) => (
                        <div key={restaurant.placeId || index} className="nearby-restaurant-card">
                          <div className="restaurant-card-header">
                            <h3>🍽️ {restaurant.name}</h3>
                            <span className="distance-badge">
                              {restaurant.distanceKm?.toFixed(1)} km
                            </span>
                          </div>
                          <div className="restaurant-card-body">
                            <p className="restaurant-address">📍 {restaurant.address}</p>
                            {restaurant.rating && (
                              <p className="restaurant-rating">⭐ {restaurant.rating} (Google)</p>
                            )}
                            {restaurant.types && restaurant.types.length > 0 && (
                              <p className="restaurant-types">
                                🍽️ {restaurant.types.slice(0, 2).join(', ')}
                              </p>
                            )}
                            <div className="not-registered-badge">
                              Not on FeedForward
                            </div>
                          </div>
                          <button className="btn-invite" disabled>
                            🚀 Invite Feature Coming Soon
                          </button>
                        </div>
                      ))}
                    </div>
                    {nearbyRestaurants.length > restaurantsPerPage && (
                      <Pagination
                        currentPage={restaurantsPage}
                        totalPages={Math.ceil(nearbyRestaurants.length / restaurantsPerPage)}
                        totalItems={nearbyRestaurants.length}
                        itemsPerPage={restaurantsPerPage}
                        onPageChange={setRestaurantsPage}
                        onItemsPerPageChange={(value) => {
                          setRestaurantsPerPage(value);
                          setRestaurantsPage(1);
                        }}
                        itemsPerPageOptions={[6, 12, 24, 48]}
                      />
                    )}
                  </div>
                )}

                {/* Empty State */}
                {!loading && foodListings.length === 0 && nearbyRestaurants.length === 0 && (
                  <div className="empty-state-card">
                    <div className="empty-icon">🔍</div>
                    <h3>No food found matching your criteria</h3>
                    <p>Try adjusting your filters or expanding the distance range</p>
                    <Button
                      variant="primary"
                      onClick={() => setFilters({
                        distance: 25,
                        category: [],
                        dietaryType: '',
                        allergens: [],
                        urgency: [],
                        sortBy: 'expiry',
                      })}
                    >
                      Reset All Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      {showMobileFilters && (
        <div className="mobile-filter-overlay" onClick={() => setShowMobileFilters(false)}>
          <div className="mobile-filter-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-filter-header">
              <h3>Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}>✕</button>
            </div>
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <div className="mobile-filter-footer">
              <Button
                variant="primary"
                fullWidth
                onClick={() => setShowMobileFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Request Food Modal */}
      {selectedFood && (
        <RequestFoodModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          food={selectedFood}
          onSuccess={handleRequestSuccess}
        />
      )}

      {/* Custom Request Modal */}
      <CustomRequestModal
        isOpen={showCustomRequestModal}
        onClose={() => setShowCustomRequestModal(false)}
        onSuccess={() => {
          fetchMyRequests();
          // Maybe show a success toast? (handled in modal)
        }}
      />
    </div>
  );
};

export default BrowseFoodPage;
