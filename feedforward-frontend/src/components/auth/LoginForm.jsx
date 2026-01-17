import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button, Input } from '../common';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginForm.css';

const LoginForm = ({ onSuccess }) => {
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
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      showSuccess('Welcome back! Login successful.');
      if (onSuccess) onSuccess(response.role);
    } catch (error) {
      showError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
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
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>

      <div className="login-options">
        <label className="remember-me">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>Remember me</span>
        </label>
        <a href="/forgot-password" className="forgot-password">
          Forgot Password?
        </a>
      </div>

      <Button type="submit" variant="primary" size="large" fullWidth loading={loading}>
        Login
      </Button>

      <p className="auth-switch">
        Don't have an account?{' '}
        <button type="button" className="link-button">
          Register now
        </button>
      </p>
    </form>
  );
};

export default LoginForm;

