import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content fade-in">
            <h1 className="hero-title">
              End Food Waste, <span className="highlight">Feed Hope</span>
            </h1>
            <p className="hero-subtitle">
              Connecting surplus food from restaurants with NGOs and shelters across India.
              Join us in making a difference, one meal at a time.
            </p>
            <div className="hero-cta">
              <Link to="/auth?tab=register&role=restaurant" className="btn btn-primary btn-large">
                I'm a Restaurant
              </Link>
              <Link to="/auth?tab=register&role=ngo" className="btn btn-outline btn-large">
                I'm an NGO
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card slide-up">
              <div className="stat-number">68M+</div>
              <div className="stat-label">Tonnes Wasted Annually in India</div>
            </div>
            <div className="stat-card slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="stat-number">5,000+</div>
              <div className="stat-label">Servings Saved Today</div>
            </div>
            <div className="stat-card slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="stat-number">Real-Time</div>
              <div className="stat-label">Smart Matching Algorithm</div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title text-center">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>1. List Food</h3>
              <p>Restaurants list surplus food with details about quantity and expiry time.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>2. Smart Match</h3>
              <p>Our AI algorithm matches food with nearby NGOs based on location and needs.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>3. Pickup</h3>
              <p>NGOs coordinate pickup and feed beneficiaries with fresh, quality food.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

