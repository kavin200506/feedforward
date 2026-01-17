import React from 'react';
import { Input, Button } from '../common';
import { FOOD_CATEGORIES, DISTANCE_OPTIONS, DIETARY_OPTIONS } from '../../utils/constants';
import { FiSearch } from 'react-icons/fi';
import './FilterSidebar.css';

const FilterSidebar = ({ filters, onFilterChange, searchQuery, onSearchChange }) => {
  const handleCategoryToggle = (category) => {
    const current = filters.category || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    onFilterChange({ category: updated });
  };

  const handleDietaryToggle = (dietary) => {
    const current = filters.dietary || [];
    const updated = current.includes(dietary)
      ? current.filter((d) => d !== dietary)
      : [...current, dietary];
    onFilterChange({ dietary: updated });
  };

  const handleReset = () => {
    onFilterChange({
      distance: 10,
      category: [],
      dietary: [],
      urgency: [],
      sortBy: 'expiry',
    });
    onSearchChange('');
  };

  return (
    <div className="filter-sidebar">
      {/* Search */}
      <div className="filter-section">
        <Input
          placeholder="Search food items..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={<FiSearch />}
        />
      </div>

      {/* Distance Filter */}
      <div className="filter-section">
        <h4 className="filter-title">Distance</h4>
        <div className="radio-group">
          {DISTANCE_OPTIONS.map((option) => (
            <label key={option.value} className="radio-label">
              <input
                type="radio"
                name="distance"
                value={option.value}
                checked={filters.distance === option.value}
                onChange={() => onFilterChange({ distance: option.value })}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="filter-section">
        <h4 className="filter-title">Food Category</h4>
        <div className="checkbox-group">
          {FOOD_CATEGORIES.map((category) => (
            <label key={category.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={(filters.category || []).includes(category.value)}
                onChange={() => handleCategoryToggle(category.value)}
              />
              <span>{category.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Dietary Filter */}
      <div className="filter-section">
        <h4 className="filter-title">Dietary Preferences</h4>
        <div className="checkbox-group">
          {DIETARY_OPTIONS.map((option) => (
            <label key={option.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={(filters.dietary || []).includes(option.value)}
                onChange={() => handleDietaryToggle(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Urgency Filter */}
      <div className="filter-section">
        <h4 className="filter-title">Urgency</h4>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input type="checkbox" />
            <span>🔴 Critical (&lt; 1hr)</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" />
            <span>🟠 High (1-2hrs)</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" />
            <span>🟡 Medium (2-4hrs)</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" />
            <span>🟢 Low (&gt; 4hrs)</span>
          </label>
        </div>
      </div>

      {/* Reset Button */}
      <Button variant="outline" size="small" fullWidth onClick={handleReset}>
        Reset All Filters
      </Button>
    </div>
  );
};

export default FilterSidebar;


