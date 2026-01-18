import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button, Input } from '../common';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginForm.css';

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await login(formData.email, formData.password);

      showSuccess('Welcome back! Login successful.');
      
      // Extract role from response - handle different response structures
      let userRole = 'RESTAURANT'; // default
      if (response?.data?.role) {
        userRole = response.data.role;
      } else if (response?.data?.data?.role) {
        userRole = response.data.data.role;
      } else if (response?.role) {
        userRole = response.role;
      }
      
      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        if (onSuccess) onSuccess(userRole);
      }, 100);
    } catch (error) {
      // Parse error message to show user-friendly messages
      let errorMessage = error.message || 'Login failed. Please check your credentials.';
      
      // Check for specific error types
      if (errorMessage.toLowerCase().includes('invalid') || 
          errorMessage.toLowerCase().includes('bad credentials') ||
          errorMessage.toLowerCase().includes('unauthorized')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      }
      
      showError(errorMessage);
      setErrors({ 
        email: errorMessage.includes('email') ? errorMessage : '',
        password: errorMessage.includes('password') || errorMessage.includes('credentials') ? errorMessage : ''
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="restaurant@example.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        icon={<FaEnvelope />}
        required
        autoComplete="email"
        disabled={loading}
      />

      <div className="password-input-wrapper">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={<FaLock />}
          required
          autoComplete="current-password"
          disabled={loading}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
          disabled={loading}
          tabIndex={0}
        >
          {showPassword ? <FaEyeSlash size={20} aria-hidden="true" /> : <FaEye size={20} aria-hidden="true" />}
        </button>
      </div>

      <div className="login-options">
        <label className="remember-me">
          <input
            type="checkbox"
            id="remember-me"
            name="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={loading}
            aria-label="Remember me on this device"
          />
          <span>Remember me</span>
        </label>
        <a href="/forgot-password" className="forgot-password" aria-label="Reset your password">
          Forgot Password?
        </a>
      </div>

      <Button 
        type="submit" 
        variant="primary" 
        size="large" 
        fullWidth 
        loading={loading}
        aria-label={loading ? 'Signing in, please wait' : 'Sign in to your account'}
      >
        {loading ? 'Signing in...' : 'Login'}
      </Button>

      <p className="auth-switch">
        Don't have an account?{' '}
        <button 
          type="button" 
          className="link-button"
          onClick={() => {
            if (onSwitchToRegister) {
              onSwitchToRegister();
            }
          }}
          aria-label="Navigate to registration form"
        >
          Register now
        </button>
      </p>
    </form>
  );
};

export default LoginForm;

