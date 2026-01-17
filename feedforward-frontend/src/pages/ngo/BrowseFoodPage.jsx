import React, { useState, useEffect } from 'react';
import { ngoService } from '../../services';
import { useNotification } from '../../context/NotificationContext';
import { Loader, Button } from '../../components/common';
import FilterSidebar from '../../components/ngo/FilterSidebar';
import FoodCard from '../../components/ngo/FoodCard';
import RequestFoodModal from '../../components/ngo/RequestFoodModal';
import { SORT_OPTIONS } from '../../utils/constants';
import { useDebounce } from '../../hooks';
import { FiFilter } from 'react-icons/fi';
import './BrowseFoodPage.css';

const BrowseFoodPage = () => {
  const { showError } = useNotification();

  const [foodListings, setFoodListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    distance: 10,
    category: [],
    dietary: [],
    urgency: [],
    sortBy: 'expiry',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchFoodListings();
  }, [filters, debouncedSearch]);

  const fetchFoodListings = async () => {
    setLoading(true);
    try {
      const params = {
        distance: filters.distance,
        category: filters.category.join(','),
        dietaryInfo: filters.dietary.join(','),
        sortBy: filters.sortBy,
        search: debouncedSearch,
      };

      const response = await ngoService.searchFood(params);
      setFoodListings(response.foodListings || []);
    } catch (error) {
      showError('Failed to load food listings');
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

  const handleRequestSuccess = () => {
    setShowRequestModal(false);
    setSelectedFood(null);
    fetchFoodListings();
  };

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
              <Button
                variant="outline"
                icon={<FiFilter />}
                className="mobile-filter-toggle"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                Filters
              </Button>
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

            {/* Food Grid */}
            {loading ? (
              <div className="loading-container">
                <Loader text="Loading food listings..." />
              </div>
            ) : foodListings.length > 0 ? (
              <div className="food-grid">
                {foodListings.map((food) => (
                  <FoodCard
                    key={food.listingId}
                    food={food}
                    onRequest={handleRequestFood}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state-card">
                <div className="empty-icon">🔍</div>
                <h3>No food found matching your criteria</h3>
                <p>Try adjusting your filters or expanding the distance range</p>
                <Button
                  variant="primary"
                  onClick={() => setFilters({
                    distance: 25,
                    category: [],
                    dietary: [],
                    urgency: [],
                    sortBy: 'expiry',
                  })}
                >
                  Reset All Filters
                </Button>
              </div>
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
    </div>
  );
};

export default BrowseFoodPage;
