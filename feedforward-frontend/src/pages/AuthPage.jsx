import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import './AuthPage.css';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'login';
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="auth-container fade-in">
        {/* Left Side - Form */}
        <div className="auth-form-section">
          {/* Logo */}
          <div className="auth-logo">
            <h1>🍽️ FeedForward</h1>
            <p className="auth-tagline">Fighting food waste, one meal at a time</p>
          </div>

          {/* Tabs */}
          <div className="auth-tabs" role="tablist" aria-label="Authentication tabs">
            <button
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
              role="tab"
              aria-selected={activeTab === 'login'}
              aria-controls="login-panel"
              id="login-tab"
            >
              Login
            </button>
            <button
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
              role="tab"
              aria-selected={activeTab === 'register'}
              aria-controls="register-panel"
              id="register-tab"
            >
              Register
            </button>
          </div>

          {/* Forms */}
          <div className="auth-form-wrapper">
            {activeTab === 'login' ? (
              <div role="tabpanel" id="login-panel" aria-labelledby="login-tab">
                <LoginForm 
                  onSuccess={(userRole) => {
                    // Navigate based on user role
                    if (userRole === 'RESTAURANT') {
                      navigate('/restaurant/dashboard');
                    } else if (userRole === 'NGO') {
                      navigate('/ngo/dashboard');
                    } else {
                      navigate('/');
                    }
                  }}
                  onSwitchToRegister={() => setActiveTab('register')}
                />
              </div>
            ) : (
              <div role="tabpanel" id="register-panel" aria-labelledby="register-tab">
                <RegisterForm 
                  onSuccess={(userRole) => {
                    // Navigate based on user role
                    if (userRole === 'RESTAURANT') {
                      navigate('/restaurant/dashboard');
                    } else if (userRole === 'NGO') {
                      navigate('/ngo/dashboard');
                    } else {
                      navigate('/');
                    }
                  }} 
                  initialRole={searchParams.get('role')}
                  onSwitchToLogin={() => setActiveTab('login')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Info Panel */}
        <div className="auth-info-section">
          <div className="auth-info-content">
            <h2>Join the Movement</h2>
            <p>Be part of India's largest food waste reduction initiative</p>

            <div className="auth-stats">
              <div className="auth-stat-item">
                <div className="stat-number">68M+</div>
                <div className="stat-label">Tonnes Wasted Annually</div>
              </div>
              <div className="auth-stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Active Restaurants</div>
              </div>
              <div className="auth-stat-item">
                <div className="stat-number">5000+</div>
                <div className="stat-label">Servings Saved Today</div>
              </div>
            </div>

            <div className="auth-features">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Smart AI Matching Algorithm</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Real-time Food Tracking</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Impact Analytics Dashboard</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>100% Free Forever</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

