import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button, Input } from '../common';
import RoleSelector from './RoleSelector';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { USER_ROLES, CUISINE_TYPES } from '../../utils/constants';
import './RegisterForm.css';

const RegisterForm = ({ onSuccess, initialRole }) => {
  const { register } = useAuth();
  const { showSuccess, showError } = useNotification();
  

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Calculate password strength
    if (name === 'password') {
      calculatePasswordStrength(value);
    }

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
      // Pass the role from response to ensure it matches backend
      const userRole = response?.data?.role || selectedRole;
      if (onSuccess) onSuccess(userRole);
    } catch (error) {
      showError(error.message || 'Registration failed. Please try again.');
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

        <div className="form-row">
          <Input
            label="Latitude"
            type="number"
            name="latitude"
            placeholder="19.0760"
            value={formData.latitude}
            onChange={handleChange}
            error={errors.latitude}
            helperText="Get from Google Maps"
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
            helperText="Get from Google Maps"
            step="any"
            required
          />
        </div>

        <div className="helper-box">
          <span className="helper-icon">💡</span>
          <span>Right-click any location on Google Maps and copy the coordinates</span>
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
        <button type="button" className="link-button" onClick={() => window.location.href = '/auth?tab=login'}>
          Login here
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;
