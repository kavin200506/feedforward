import React from 'react';
import { Input, Button } from '../common';
import { FOOD_CATEGORIES, DISTANCE_OPTIONS, DIETARY_TYPES, ALLERGEN_OPTIONS } from '../../utils/constants';
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

  // Handle dietary type (radio - single choice)
  const handleDietaryTypeChange = (dietaryType) => {
    onFilterChange({ dietaryType });
  };

  // Handle allergens (checkboxes - multi-select)
  const handleAllergenToggle = (allergen) => {
    const current = filters.allergens || [];
    const updated = current.includes(allergen)
      ? current.filter((a) => a !== allergen)
      : [...current, allergen];
    onFilterChange({ allergens: updated });
  };

  const handleReset = () => {
    onFilterChange({
      distance: 10,
      category: [],
      dietaryType: '',
      allergens: [],
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

      {/* Dietary Type Filter - Optional - Radio Buttons */}
      <div className="filter-section">
        <h4 className="filter-title">
          Dietary Type
          <span className="filter-helper">(Optional - filter by type)</span>
        </h4>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="dietaryType"
              value=""
              checked={!filters.dietaryType || filters.dietaryType === ''}
              onChange={() => handleDietaryTypeChange('')}
            />
            <div className="radio-content">
              <span className="radio-main">All Types</span>
              <span className="radio-description">Show all food regardless of dietary type</span>
            </div>
          </label>
          {DIETARY_TYPES.map((type) => (
            <label key={type.value} className="radio-label">
              <input
                type="radio"
                name="dietaryType"
                value={type.value}
                checked={filters.dietaryType === type.value}
                onChange={() => handleDietaryTypeChange(type.value)}
              />
              <div className="radio-content">
                <span className="radio-main">{type.label}</span>
                <span className="radio-description">{type.description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Allergen & Dietary Properties Filter - Optional - Checkboxes */}
      <div className="filter-section">
        <h4 className="filter-title">
          Allergen & Dietary Info
          <span className="filter-helper">(Select all that apply)</span>
        </h4>
        <div className="checkbox-group">
          {ALLERGEN_OPTIONS.map((option) => (
            <label key={option.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={(filters.allergens || []).includes(option.value)}
                onChange={() => handleAllergenToggle(option.value)}
              />
              <div className="checkbox-content">
                <span className="checkbox-main">{option.label}</span>
                <span className="checkbox-description">{option.description}</span>
              </div>
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


