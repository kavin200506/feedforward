import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services';
import { Skeleton, Speedometer } from '../components/common';
import './ImpactPage.css';

const ImpactPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImpactStats();
  }, []);

  const fetchImpactStats = async () => {
    try {
      const data = await dashboardService.getImpactStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch impact stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="impact-page">
      {/* Hero Section */}
      <div className="impact-hero">
        <div className="container">
          <h1 className="impact-title">Our Impact</h1>
          <p className="impact-subtitle">
            FeedForward connects abundance with need, creating a sustainable ecosystem that minimizes food waste.
          </p>

          {/* Metrics Section - Speedometers */}
          <div className="metrics-speedometer-grid">
            <div className="speedometer-item">
              {loading ? (
                <Skeleton type="circle" width="200px" height="120px" style={{ borderRadius: '100px 100px 0 0' }} />
              ) : (
                <Speedometer 
                  value={stats?.totalServingsSaved || 0} 
                  label="Meals Saved" 
                  max={10000} // Target max for visual
                  suffix="+"
                  color="#2ecc71"
                />
              )}
            </div>
            
            <div className="speedometer-item">
              {loading ? (
                 <Skeleton type="circle" width="200px" height="120px" style={{ borderRadius: '100px 100px 0 0' }} />
              ) : (
                <Speedometer 
                  value={(stats?.totalRestaurants || 0) + (stats?.totalNgos || 0)} 
                  label="Active Partners" 
                  max={100} 
                  color="#3498db"
                />
              )}
            </div>
            
            <div className="speedometer-item">
              {loading ? (
                 <Skeleton type="circle" width="200px" height="120px" style={{ borderRadius: '100px 100px 0 0' }} />
              ) : (
                <Speedometer 
                  value={stats?.co2Saved ? Math.round(stats.co2Saved) : 0} 
                  label="kg CO2 Saved" 
                  max={5000} 
                  color="#9b59b6"
                />
              )}
            </div>
            
            <div className="speedometer-item">
              {loading ? (
                 <Skeleton type="circle" width="200px" height="120px" style={{ borderRadius: '100px 100px 0 0' }} />
              ) : (
                <Speedometer 
                  value={stats?.totalBeneficiariesFed || 0} 
                  label="People Fed" 
                  max={10000}
                  color="#f1c40f"
                />
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="container">
        {/* Restaurants & Donors Section */}
        <div className="impact-section">
          <div className="section-header">
            <h2>For Restaurants & Occasion Donors</h2>
          </div>
          <div className="impact-cards-grid">
            <div className="impact-card">
              <h3>Operational Efficiency</h3>
              <ul className="impact-list">
                <li>Reduced costs associated with food waste disposal and management.</li>
                <li>Simplified donation process through our intuitive digital platform.</li>
                <li>Real-time matching algorithms ensuring efficient pickup coordination.</li>
              </ul>
            </div>
            <div className="impact-card">
              <h3>Sustainability & Responsibility</h3>
              <ul className="impact-list">
                <li>Measurable contribution to corporate social responsibility (CSR) goals.</li>
                <li>Transparent tracking and traceability of every donated meal.</li>
                <li>Significant reduction in the establishment's carbon footprint.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* NGOs Section */}
        <div className="impact-section">
          <div className="section-header">
            <h2>For NGOs & Communities</h2>
          </div>
          <div className="impact-cards-grid">
            <div className="impact-card">
              <h3>Access & Reliability</h3>
              <ul className="impact-list">
                <li>Faster, reliable access to high-quality surplus food resources.</li>
                <li>Optimized pickup routes reducing transportation time and costs.</li>
                <li>Better capacity planning through predictive availability insights.</li>
              </ul>
            </div>
            <div className="impact-card">
              <h3>Accountability</h3>
              <ul className="impact-list">
                <li>Digital records simplifying reporting and compliance requirements.</li>
                <li>Reduced manual coordination overhead for field volunteers.</li>
                <li>Verifiable impact data to support funding and grant applications.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Overall Impact Section */}
        <div className="impact-section">
          <div className="section-header">
            <h2>Social & Environmental Impact</h2>
          </div>
          <div className="impact-cards-grid">
            <div className="impact-card">
              <h3>Combating Hunger</h3>
              <p style={{ lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                Directly channeling surplus food to those in need, helping to bridge the gap between food production and consumption inequality in our local communities.
              </p>
            </div>
            <div className="impact-card">
              <h3>Environmental Protection</h3>
              <p style={{ lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                Diverting organic waste from landfills substantially reduces methane emissions, a potent greenhouse gas, contributing to climate change mitigation.
              </p>
            </div>
            <div className="impact-card">
              <h3>Community Resilience</h3>
              <p style={{ lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                Fostering stronger local networks between businesses and social organizations, creating a more resilient and interconnected community support system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactPage;
