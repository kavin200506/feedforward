// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// User Roles
export const USER_ROLES = {
  RESTAURANT: 'RESTAURANT',
  NGO: 'NGO',
  ADMIN: 'ADMIN',
};

// Food Categories
export const FOOD_CATEGORIES = [
  // IMPORTANT: value must match backend enum com.feedforward.enums.FoodCategory
  { value: 'COOKED_RICE', label: '🍚 Cooked Rice', emoji: '🍚' },
  { value: 'VEGETABLES', label: '🥗 Vegetables', emoji: '🥗' },
  { value: 'BREAD', label: '🍞 Bread', emoji: '🍞' },
  { value: 'PROTEINS', label: '🍗 Proteins', emoji: '🍗' },
  { value: 'SWEETS', label: '🍰 Sweets', emoji: '🍰' },
  { value: 'FRUITS', label: '🍎 Fruits', emoji: '🍎' },
  { value: 'BEVERAGES', label: '🥤 Beverages', emoji: '🥤' },
  { value: 'SNACKS', label: '🍿 Snacks', emoji: '🍿' },
  { value: 'OTHER', label: '📦 Other', emoji: '📦' },
];

// Food Units
export const FOOD_UNITS = [
  { value: 'Servings', label: 'Servings' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'Liters', label: 'Liters' },
];

// Request Status
export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PICKED_UP: 'PICKED_UP',
  COMPLETED: 'COMPLETED',
};

// Food Listing Status
export const LISTING_STATUS = {
  AVAILABLE: 'AVAILABLE',
  REQUESTED: 'REQUESTED',
  PICKED_UP: 'PICKED_UP',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
};

// Urgency Levels
export const URGENCY_LEVELS = {
  CRITICAL: { value: 'CRITICAL', label: 'Critical', color: '#F44336', threshold: 60 },
  HIGH: { value: 'HIGH', label: 'High', color: '#FF9800', threshold: 120 },
  MEDIUM: { value: 'MEDIUM', label: 'Medium', color: '#FFC107', threshold: 240 },
  LOW: { value: 'LOW', label: 'Low', color: '#8BC34A', threshold: Infinity },
};

// Dietary Information
export const DIETARY_OPTIONS = [
  { value: 'Vegetarian', label: '🥬 Vegetarian' },
  { value: 'Non-Vegetarian', label: '🍖 Non-Vegetarian' },
  { value: 'Contains Nuts', label: '🥜 Contains Nuts' },
  { value: 'Gluten-Free', label: '🌾 Gluten-Free' },
  { value: 'Dairy-Free', label: '🥛 Dairy-Free' },
];

// Distance Filters
export const DISTANCE_OPTIONS = [
  { value: 5, label: 'Within 5 km' },
  { value: 10, label: 'Within 10 km' },
  { value: 25, label: 'Within 25 km' },
];

// Indian Cuisine Types
export const CUISINE_TYPES = [
  'North Indian',
  'South Indian',
  'Chinese',
  'Bakery',
  'Multi-cuisine',
  'Continental',
  'Street Food',
  'Fast Food',
  'Desserts',
];

// Sort Options
export const SORT_OPTIONS = [
  { value: 'expiry', label: '⏰ Expiring Soon' },
  { value: 'distance', label: '📍 Nearest First' },
  { value: 'quantity', label: '📦 Most Quantity' },
  { value: 'rating', label: '⭐ Highest Rated' },
  { value: 'newest', label: '🆕 Recently Added' },
];
