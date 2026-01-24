import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button, Input } from '../common';
import RoleSelector from './RoleSelector';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaMapMarkerAlt, FaLocationArrow, FaCheckCircle } from 'react-icons/fa';
import { USER_ROLES, CUISINE_TYPES } from '../../utils/constants';
import locationService from '../../services/locationService';
import './RegisterForm.css';

const RegisterForm = ({ onSuccess, initialRole, onSwitchToLogin }) => {
  const { register } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  

  // Determine initial role from URL parameter or default to RESTAURANT
  const getInitialRole = () => {
    if (initialRole === 'ngo') {
      return USER_ROLES.NGO;
    } else if (initialRole === 'restaurant') {
      return USER_ROLES.RESTAURANT;
    }
    return USER_ROLES.RESTAURANT;
  };

  const [selectedRole, setSelectedRole] = useState(getInitialRole());
  
  // Update role when initialRole prop changes
  useEffect(() => {
    if (initialRole) {
      const role = initialRole === 'ngo' ? USER_ROLES.NGO : USER_ROLES.RESTAURANT;
      setSelectedRole(role);
    }
  }, [initialRole]);

  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',

    // Organization Details
    organizationName: '',
    address: '',
    latitude: '',
    longitude: '',

    // Restaurant Specific
    cuisineType: '',

    // NGO Specific
    beneficiariesCount: '',
    foodPreferences: [],
    dietaryRequirements: [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [capturedCoordinates, setCapturedCoordinates] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Calculate password strength
    if (name === 'password') {
      calculatePasswordStrength(value);
    }

    // Clear GPS success state if coordinates are manually edited
    if (name === 'latitude' || name === 'longitude') {
      setGpsSuccess(false);
      setCapturedCoordinates(null);
    }
    // Note: Address can be edited manually without clearing GPS success

    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (name, value) => {
    setFormData((prev) => {
      const current = prev[name] || [];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [name]: updated };
    });
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    setPasswordStrength(Math.min(strength, 100));
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 40) return { label: 'Weak', color: '#F44336' };
    if (passwordStrength < 70) return { label: 'Medium', color: '#FF9800' };
    return { label: 'Strong', color: '#4CAF50' };
  };

  const handleGetCurrentLocation = async () => {
    setGpsLoading(true);
    setGpsError('');
    setGpsSuccess(false);
    setCapturedCoordinates(null);

    try {
      // Call locationService to get location with address
      if (!locationService || !locationService.getLocationWithAddress) {
        throw new Error('Location service is not available.');
      }
      const { latitude, longitude, address } = await locationService.getLocationWithAddress();

      // Update form data with coordinates and address
      setFormData((prev) => ({
        ...prev,
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
        address: address || prev.address, // Auto-fill address if available, otherwise keep existing
      }));

      // Store captured coordinates for display
      setCapturedCoordinates({
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
      });

      setGpsLoading(false);
      setGpsSuccess(true);
      setGpsError('');

      // Clear any existing errors for latitude/longitude/address
      setErrors((prev) => ({
        ...prev,
        latitude: '',
        longitude: '',
        address: '',
      }));

      // Show success message
      if (address) {
        showSuccess(`Location captured! Address auto-filled.`);
      } else {
        showSuccess(`Location captured! Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`);
        // Show warning if address conversion failed
        setGpsError('Address could not be automatically retrieved. Please enter your address manually.');
      }
    } catch (error) {
      setGpsLoading(false);
      setGpsSuccess(false);
      setCapturedCoordinates(null);

      let errorMessage = error.message || 'Failed to get your location. Please try again.';
      setGpsError(errorMessage);

      // Set validation errors if permission denied
      if (errorMessage.includes('permission denied') || errorMessage.includes('Permission denied')) {
        setErrors((prev) => ({
          ...prev,
          latitude: 'GPS location is required',
          longitude: 'GPS location is required',
        }));
      }

      showError(errorMessage);
    }
  };

  const validate = () => {
    const newErrors = {};

    // Personal Details
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Organization Details
    if (!formData.organizationName) {
      newErrors.organizationName = `${selectedRole === USER_ROLES.RESTAURANT ? 'Restaurant' : 'Organization'} name is required`;
    }
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.latitude) {
      newErrors.latitude = 'Latitude is required';
    } else if (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = 'Please enter a valid latitude (-90 to 90)';
    }
    if (!formData.longitude) {
      newErrors.longitude = 'Longitude is required';
    } else if (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = 'Please enter a valid longitude (-180 to 180)';
    }

    // Role Specific
    if (selectedRole === USER_ROLES.RESTAURANT && !formData.cuisineType) {
      newErrors.cuisineType = 'Cuisine type is required';
    }

    if (selectedRole === USER_ROLES.NGO) {
      if (!formData.beneficiariesCount) {
        newErrors.beneficiariesCount = 'Beneficiaries count is required';
      } else if (formData.beneficiariesCount < 1) {
        newErrors.beneficiariesCount = 'Must be at least 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        role: selectedRole,
        organizationName: formData.organizationName,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      };

      if (selectedRole === USER_ROLES.RESTAURANT) {
        payload.cuisineType = formData.cuisineType;
      } else {
        payload.beneficiariesCount = parseInt(formData.beneficiariesCount);
        payload.foodPreferences = formData.foodPreferences.join(', ');
        payload.dietaryRequirements = formData.dietaryRequirements.join(', ');
      }

      const response = await register(payload);
      showSuccess('Registered successfully!');
      
      // Extract role from response
      // Response structure from authService: { success: true, data: AuthResponse { role: "RESTAURANT" | "NGO" } }
      // AuthResponse is at response.data
      let userRole = null;
      if (response?.data?.role) {
        userRole = response.data.role;
      } else if (response?.data?.data?.role) {
        // Fallback: check if nested deeper
        userRole = response.data.data.role;
      } else {
        // Use selected role as fallback
        userRole = selectedRole;
      }
      
      // Ensure role is uppercase to match USER_ROLES constants
      userRole = userRole?.toUpperCase() || selectedRole;
      
      // Call onSuccess callback with the role
      if (onSuccess) {
        onSuccess(userRole);
      } else {
        // Fallback navigation if onSuccess is not provided
        if (userRole === USER_ROLES.RESTAURANT) {
          navigate('/restaurant/dashboard');
        } else if (userRole === USER_ROLES.NGO) {
          navigate('/ngo/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      // Handle 409 Conflict error (user already exists)
      if (error.isConflict || error.statusCode === 409) {
        const errorMessage = error.message || 'This email is already registered.';
        const lowerMessage = errorMessage.toLowerCase();
        
        // Function to handle navigation to login
        const handleGoToLogin = () => {
          if (onSwitchToLogin) {
            onSwitchToLogin();
          } else {
            navigate('/auth?tab=login');
          }
        };
        
        // Check if it's a duplicate email error
        if (lowerMessage.includes('email') || 
            lowerMessage.includes('user with this email')) {
          const friendlyMessage = 'This email is already registered.';
          setErrors({ ...errors, email: 'This email is already registered' });
          
          // Show error with "Go to Login" button
          showError(
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>{friendlyMessage}</div>
              <button
                onClick={handleGoToLogin}
                style={{
                  marginTop: '8px',
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  color: '#d32f2f',
                  border: '1px solid #d32f2f',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  alignSelf: 'flex-start',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#ffebee';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                Go to Login
              </button>
            </div>,
            { autoClose: 8000 }
          );
        }
        // Check if it's a duplicate phone error
        else if (lowerMessage.includes('phone') || 
                 lowerMessage.includes('phone number')) {
          const friendlyMessage = 'This phone number is already registered.';
          setErrors({ ...errors, phone: 'This phone number is already registered' });
          showError(friendlyMessage);
        }
        // Generic 409 error
        else {
          const friendlyMessage = 'This account already exists.';
          showError(
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>{friendlyMessage}</div>
              <button
                onClick={handleGoToLogin}
                style={{
                  marginTop: '8px',
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  color: '#d32f2f',
                  border: '1px solid #d32f2f',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  alignSelf: 'flex-start',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#ffebee';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                Go to Login
              </button>
            </div>,
            { autoClose: 8000 }
          );
        }
      }
      // Handle other errors
      else {
        let errorMessage = error.message || 'Registration failed. Please try again.';
        
        // Check for duplicate errors in message (fallback)
        const lowerMessage = errorMessage.toLowerCase();
        if (lowerMessage.includes('email') && 
            (lowerMessage.includes('already exists') || 
             lowerMessage.includes('duplicate') ||
             lowerMessage.includes('already registered'))) {
          errorMessage = 'This email is already registered.';
          setErrors({ ...errors, email: 'This email is already registered' });
          
          // Show error with "Go to Login" button for duplicate email
          const handleGoToLogin = () => {
            if (onSwitchToLogin) {
              onSwitchToLogin();
            } else {
              navigate('/auth?tab=login');
            }
          };
          
          showError(
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>{errorMessage}</div>
              <button
                onClick={handleGoToLogin}
                style={{
                  marginTop: '8px',
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  color: '#d32f2f',
                  border: '1px solid #d32f2f',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  alignSelf: 'flex-start',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#ffebee';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                Go to Login
              </button>
            </div>,
            { autoClose: 8000 }
          );
        } else if (lowerMessage.includes('phone') && 
                   (lowerMessage.includes('already exists') || 
                    lowerMessage.includes('duplicate'))) {
          errorMessage = 'This phone number is already registered. Please use a different phone number.';
          setErrors({ ...errors, phone: 'This phone number is already registered' });
          showError(errorMessage);
        } else {
          showError(errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const strengthInfo = getPasswordStrengthLabel();

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      {/* Role Selector */}
      <RoleSelector selectedRole={selectedRole} onChange={setSelectedRole} />

      {/* Personal Details Section */}
      <div className="form-section">
        <h3 className="section-title">Personal Details</h3>

        <Input
          label="Full Name"
          type="text"
          name="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          icon={<FaUser />}
          required
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={<FaEnvelope />}
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          placeholder="9876543210"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          helperText="Enter 10-digit mobile number"
          icon={<FaPhone />}
          required
          maxLength={10}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={<FaLock />}
          required
        />
        {formData.password && (
          <div className="password-strength">
            <div className="strength-bar">
              <div
                className="strength-fill"
                style={{
                  width: `${passwordStrength}%`,
                  backgroundColor: strengthInfo.color,
                }}
              ></div>
            </div>
            <span className="strength-label" style={{ color: strengthInfo.color }}>
              {strengthInfo.label}
            </span>
          </div>
        )}

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          icon={<FaLock />}
          required
        />
      </div>

      {/* Organization Details */}
      <div className="form-section">
        <h3 className="section-title">
          {selectedRole === USER_ROLES.RESTAURANT ? 'Restaurant' : 'Organization'} Details
        </h3>

        <Input
          label={`${selectedRole === USER_ROLES.RESTAURANT ? 'Restaurant' : 'Organization'} Name`}
          type="text"
          name="organizationName"
          placeholder={selectedRole === USER_ROLES.RESTAURANT ? 'City Restaurant' : 'Community Shelter'}
          value={formData.organizationName}
          onChange={handleChange}
          error={errors.organizationName}
          required
        />

        <div className="input-wrapper">
          <label className="input-label">
            Full Address <span className="input-required">*</span>
          </label>
          <textarea
            name="address"
            className="input textarea"
            placeholder="123 Main Street, Area, City, State, Pincode"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            required
          />
          {errors.address && <span className="input-error-message shake">{errors.address}</span>}
        </div>

        {/* GPS Location Capture */}
        <div className="gps-location-section">
          <button
            type="button"
            className="gps-button"
            onClick={handleGetCurrentLocation}
            disabled={gpsLoading}
          >
            {gpsLoading ? (
              <>
                <span className="gps-spinner">⏳</span>
                Getting Location...
              </>
            ) : (
              <>
                <span>📍</span>
                Use Current Location (GPS)
              </>
            )}
          </button>
          
          {gpsError && (
            <div className="gps-error">
              <span className="gps-error-icon">⚠️</span>
              <span>{gpsError}</span>
            </div>
          )}
          
          {gpsSuccess && capturedCoordinates && (
            <div className="gps-success-container">
              <div className="gps-success">
                <FaCheckCircle className="gps-success-icon" />
                <span>✅ Location Captured</span>
              </div>
              {capturedCoordinates && (
                <div className="gps-coordinates">
                  Lat: {capturedCoordinates.latitude}, Lng: {capturedCoordinates.longitude}
              </div>
              )}
            </div>
          )}
        </div>

        <div className="form-row">
          <Input
            label="Latitude"
            type="number"
            name="latitude"
            placeholder="19.0760"
            value={formData.latitude}
            onChange={handleChange}
            error={errors.latitude}
            step="any"
            required
          />

          <Input
            label="Longitude"
            type="number"
            name="longitude"
            placeholder="72.8777"
            value={formData.longitude}
            onChange={handleChange}
            error={errors.longitude}
            step="any"
            required
          />
        </div>
      </div>

      {/* Restaurant Specific Fields */}
      {selectedRole === USER_ROLES.RESTAURANT && (
        <div className="form-section">
          <div className="input-wrapper">
            <label className="input-label">
              Cuisine Type <span className="input-required">*</span>
            </label>
            <select
              name="cuisineType"
              className="input"
              value={formData.cuisineType}
              onChange={handleChange}
              required
            >
              <option value="">Select cuisine type</option>
              {CUISINE_TYPES.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
            {errors.cuisineType && (
              <span className="input-error-message shake">{errors.cuisineType}</span>
            )}
          </div>
        </div>
      )}

      {/* NGO Specific Fields */}
      {selectedRole === USER_ROLES.NGO && (
        <div className="form-section">
          <Input
            label="Number of Beneficiaries"
            type="number"
            name="beneficiariesCount"
            placeholder="150"
            value={formData.beneficiariesCount}
            onChange={handleChange}
            error={errors.beneficiariesCount}
            helperText="Average number of people served daily"
            min={1}
            required
          />

          <div className="checkbox-group">
            <label className="input-label">Food Preferences</label>
            <div className="checkbox-options">
              {['Cooked Rice', 'Vegetables', 'Bread', 'Proteins', 'Sweets', 'Any'].map((pref) => (
                <label key={pref} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.foodPreferences.includes(pref)}
                    onChange={() => handleCheckboxChange('foodPreferences', pref)}
                  />
                  <span>{pref}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="checkbox-group">
            <label className="input-label">Dietary Requirements</label>
            <div className="checkbox-options">
              {['Vegetarian Only', 'Non-Veg OK', 'Gluten-Free', 'Nut-Free'].map((req) => (
                <label key={req} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.dietaryRequirements.includes(req)}
                    onChange={() => handleCheckboxChange('dietaryRequirements', req)}
                  />
                  <span>{req}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <Button type="submit" variant="primary" size="large" fullWidth loading={loading}>
        Register as {selectedRole === USER_ROLES.RESTAURANT ? 'Restaurant' : 'NGO'}
      </Button>

      <p className="auth-switch">
        Already have an account?{' '}
        <button 
          type="button" 
          className="link-button" 
          onClick={() => {
            if (onSwitchToLogin) {
              onSwitchToLogin();
            } else {
              window.location.href = '/auth?tab=login';
            }
          }}
          aria-label="Navigate to login form"
        >
          Login here
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;
