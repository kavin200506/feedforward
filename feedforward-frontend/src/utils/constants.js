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
  { value: 'COOKED_RICE', label: '🍚 Cooked Rice (Biryani, Pulao, Plain Rice)', emoji: '🍚' },
  { value: 'CURRIES', label: '🍛 Curries & Gravies (Dal, Sambar, Paneer Curry)', emoji: '🍛' },
  { value: 'VEGETABLES', label: '🥗 Vegetables (Cooked vegetables, Salads)', emoji: '🥗' },
  { value: 'BREAD', label: '🍞 Bread & Roti (Chapati, Naan, Parotta, Puri)', emoji: '🍞' },
  { value: 'PROTEINS', label: '🍗 Proteins (Chicken, Fish, Eggs, Paneer dishes)', emoji: '🍗' },
  { value: 'MIXED_MEALS', label: '🥘 Mixed Meals (Complete thalis, combo plates)', emoji: '🥘' },
  { value: 'SWEETS', label: '🍰 Sweets & Desserts (Payasam, Halwa, Cakes)', emoji: '🍰' },
  { value: 'FRUITS', label: '🍎 Fruits (Fresh fruits, Fruit salads)', emoji: '🍎' },
  { value: 'BEVERAGES', label: '🥤 Beverages (Juice, Buttermilk, Tea/Coffee)', emoji: '🥤' },
  { value: 'SNACKS', label: '🍿 Snacks (Samosa, Vada, Biscuits, Chips)', emoji: '🍿' },
  { value: 'OTHER', label: '📦 Other (Specify in description)', emoji: '📦' },
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

// Dietary Types (REQUIRED - Single Choice - Radio Buttons)
export const DIETARY_TYPES = [
  { value: 'Vegetarian', label: '🥬 Vegetarian', description: 'No meat, fish, or chicken' },
  { value: 'Eggetarian', label: '🥚 Eggetarian', description: 'Contains eggs, but no meat/fish' },
  { value: 'Non-Vegetarian', label: '🍖 Non-Vegetarian', description: 'Contains meat, fish, or chicken' },
  { value: 'Vegan', label: '🌱 Vegan', description: 'No animal products (no dairy, eggs, honey)' },
];

// Allergen & Dietary Properties (OPTIONAL - Multi-select - Checkboxes)
export const ALLERGEN_OPTIONS = [
  { value: 'Contains Nuts', label: '🥜 Contains Nuts', description: 'Peanuts, Cashews, Almonds' },
  { value: 'Contains Gluten', label: '🌾 Contains Gluten', description: 'Wheat, Barley, Rye' },
  { value: 'Contains Dairy', label: '🥛 Contains Dairy', description: 'Milk, Cheese, Paneer, Ghee' },
  { value: 'Contains Seafood', label: '🦐 Contains Seafood', description: 'Fish, Prawns, Crab' },
  { value: 'Contains Eggs', label: '🥚 Contains Eggs', description: 'Contains eggs' },
  { value: 'High Spice Level', label: '🌶️ High Spice Level', description: 'Very spicy' },
  { value: 'High Sodium', label: '🧂 High Sodium', description: 'Salty' },
  { value: 'High Sugar', label: '🍬 High Sugar', description: 'Sweet dishes' },
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
