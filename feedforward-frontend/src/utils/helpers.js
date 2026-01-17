import { URGENCY_LEVELS } from './constants';

/**
 * Calculate urgency level and color based on time remaining
 */
export const calculateUrgency = (expiryTime) => {
  const now = new Date();
  const expiry = new Date(expiryTime);
  const minutesRemaining = Math.floor((expiry - now) / (1000 * 60));

  if (minutesRemaining < URGENCY_LEVELS.CRITICAL.threshold) {
    return { level: 'CRITICAL', color: URGENCY_LEVELS.CRITICAL.color, minutes: minutesRemaining };
  } else if (minutesRemaining < URGENCY_LEVELS.HIGH.threshold) {
    return { level: 'HIGH', color: URGENCY_LEVELS.HIGH.color, minutes: minutesRemaining };
  } else if (minutesRemaining < URGENCY_LEVELS.MEDIUM.threshold) {
    return { level: 'MEDIUM', color: URGENCY_LEVELS.MEDIUM.color, minutes: minutesRemaining };
  } else {
    return { level: 'LOW', color: URGENCY_LEVELS.LOW.color, minutes: minutesRemaining };
  }
};

/**
 * Format time remaining in human-readable format
 */
export const formatTimeRemaining = (expiryTime) => {
  const now = new Date();
  const expiry = new Date(expiryTime);
  const minutesRemaining = Math.floor((expiry - now) / (1000 * 60));

  if (minutesRemaining < 0) return 'Expired';
  if (minutesRemaining < 60) return `${minutesRemaining}m`;
  
  const hours = Math.floor(minutesRemaining / 60);
  const minutes = minutesRemaining % 60;
  
  if (hours < 24) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format phone number for India
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('91')) {
    return `+91 ${cleaned.substring(2, 7)} ${cleaned.substring(7)}`;
  }
  return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

const toRad = (degrees) => {
  return (degrees * Math.PI) / 180;
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const colors = {
    AVAILABLE: '#4CAF50',
    PENDING: '#FF9800',
    APPROVED: '#2196F3',
    REQUESTED: '#FF9800',
    PICKED_UP: '#9C27B0',
    COMPLETED: '#4CAF50',
    REJECTED: '#F44336',
    EXPIRED: '#757575',
    CANCELLED: '#757575',
  };
  return colors[status] || '#757575';
};

/**
 * Get urgency color code
 */
export const getUrgencyColor = (urgencyLevel) => {
  const colors = {
    CRITICAL: '#F44336',
    HIGH: '#FF9800',
    MEDIUM: '#FFC107',
    LOW: '#4CAF50',
  };
  return colors[urgencyLevel] || '#757575';
};

/**
 * Get category emoji
 */
export const getCategoryEmoji = (category) => {
  const emojiMap = {
    'COOKED_RICE': '🍚',
    'VEGETABLES': '🥗',
    'BREAD': '🍞',
    'PROTEINS': '🍗',
    'SWEETS': '🍰',
    'FRUITS': '🍎',
    'BEVERAGES': '🥤',
    'SNACKS': '🍿',
    'OTHER': '📦',
  };
  return emojiMap[category] || '🍽️';
};

/**
 * Format distance
 */
export const formatDistance = (km) => {
  if (!km) return 'N/A';
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${parseFloat(km).toFixed(1)} km`;
};

/**
 * Validate phone number (Indian format)
 */
export const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith('91'));
};
