/**
 * Location Service
 * Handles GPS location capture and reverse geocoding using Google Maps API
 */

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

// Debug: Check if API key is loaded (only in development)
if (import.meta.env.DEV) {
  console.log('Google Maps API Key loaded:', GOOGLE_MAPS_API_KEY ? 'Yes (length: ' + GOOGLE_MAPS_API_KEY.length + ')' : 'No - Missing!');
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('⚠️ VITE_GOOGLE_MAPS_API_KEY is not set in .env file');
  }
}

/**
 * Get current location using browser's Geolocation API
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6))
        });
      },
      (error) => {
        let errorMessage = 'Failed to get your location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting your location.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

/**
 * Reverse geocode coordinates to get human-readable address
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<string>} Formatted address string
 */
export const reverseGeocode = async (latitude, longitude) => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key is missing. Check VITE_GOOGLE_MAPS_API_KEY in .env file');
    throw new Error('Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.');
  }

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new Error('Invalid coordinates. Latitude and longitude must be numbers.');
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error('Invalid latitude. Must be between -90 and 90.');
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error('Invalid longitude. Must be between -180 and 180.');
  }

  try {
    const url = `${GEOCODING_API_URL}?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    console.log('Geocoding API URL:', url.replace(GOOGLE_MAPS_API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Geocoding API HTTP error:', response.status, errorText);
      throw new Error(`Geocoding API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Geocoding API response status:', data.status);

    if (data.status === 'ZERO_RESULTS') {
      throw new Error('No address found for the given coordinates.');
    }

    if (data.status === 'REQUEST_DENIED') {
      console.error('Geocoding API denied. Response:', data);
      throw new Error('Geocoding API request denied. Please check your API key and ensure Geocoding API is enabled.');
    }

    if (data.status === 'OVER_QUERY_LIMIT') {
      throw new Error('Geocoding API quota exceeded. Please try again later.');
    }

    if (data.status === 'INVALID_REQUEST') {
      console.error('Invalid geocoding request. Response:', data);
      throw new Error('Invalid geocoding request. Please check the coordinates.');
    }

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Geocoding failed. Response:', data);
      throw new Error(`Geocoding failed: ${data.status || 'Unknown error'}`);
    }

    // Return the formatted address from the first result
    const formattedAddress = data.results[0].formatted_address;
    console.log('Formatted address:', formattedAddress);
    return formattedAddress;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    // Re-throw custom errors
    if (error.message) {
      throw error;
    }
    
    // Handle unexpected errors
    throw new Error(`Failed to get address: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Get current location and convert it to a human-readable address
 * @returns {Promise<{latitude: number, longitude: number, address: string}>}
 */
export const getLocationWithAddress = async () => {
  try {
    // Step 1: Get GPS coordinates
    const { latitude, longitude } = await getCurrentLocation();
    
    // Step 2: Convert coordinates to address
    let address = '';
    try {
      console.log('Calling reverseGeocode with:', { latitude, longitude, apiKey: GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing' });
      address = await reverseGeocode(latitude, longitude);
      console.log('Reverse geocoding success:', address);
    } catch (geocodeError) {
      // If geocoding fails, we still return the coordinates
      // but log the error (address will be empty)
      console.error('Reverse geocoding failed:', geocodeError.message);
      console.error('Full error:', geocodeError);
      // Don't throw - allow user to manually enter address
    }
    
    return {
      latitude,
      longitude,
      address
    };
  } catch (error) {
    // Re-throw GPS errors
    throw error;
  }
};

// Export as a service object
const locationService = {
  getCurrentLocation,
  reverseGeocode,
  getLocationWithAddress
};

export default locationService;

