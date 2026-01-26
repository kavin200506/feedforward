import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiMapPin, FiClock, FiUsers, FiPackage, FiBell } from 'react-icons/fi';
import './HowItWorksPage.css';

const HowItWorksPage = () => {
  return (
    <div className="how-it-works-page">
      {/* Hero Section */}
      <section className="how-it-works-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="page-title">How FeedForward Works</h1>
            <p className="page-subtitle">
              A simple, efficient platform connecting surplus food with those who need it most
            </p>
          </div>
        </div>
      </section>

      {/* For Restaurants Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">For Restaurants</h2>
            <p className="section-description">
              Turn your surplus food into a force for good. It's simple, fast, and impactful.
            </p>
          </div>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <FiPackage size={32} />
              </div>
              <h3 className="step-title">List Your Surplus Food</h3>
              <p className="step-description">
                Create a listing with details about your surplus food: quantity, category, 
                dietary information, and expiry time. Our platform makes it quick and easy.
              </p>
              <ul className="step-features">
                <li><FiCheckCircle /> Add food details in minutes</li>
                <li><FiCheckCircle /> Set pickup time and location</li>
                <li><FiCheckCircle /> Specify dietary requirements</li>
              </ul>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <FiBell size={32} />
              </div>
              <h3 className="step-title">Automatic NGO Notification</h3>
              <p className="step-description">
                Our smart matching system automatically notifies nearby NGOs that match 
                your food's dietary requirements. They receive instant SMS notifications.
              </p>
              <ul className="step-features">
                <li><FiCheckCircle /> Location-based matching</li>
                <li><FiCheckCircle /> Dietary requirement filtering</li>
                <li><FiCheckCircle /> Real-time SMS notifications</li>
              </ul>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <FiUsers size={32} />
              </div>
              <h3 className="step-title">Review & Approve Requests</h3>
              <p className="step-description">
                NGOs will request your food listing. Review their requests, approve the ones 
                that work for you, and coordinate pickup times.
              </p>
              <ul className="step-features">
                <li><FiCheckCircle /> View all incoming requests</li>
                <li><FiCheckCircle /> Approve or reject requests</li>
                <li><FiCheckCircle /> Set convenient pickup times</li>
              </ul>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-icon">
                <FiCheckCircle size={32} />
              </div>
              <h3 className="step-title">Track Your Impact</h3>
              <p className="step-description">
                Monitor your donations, see how many servings you've saved, and track your 
                contribution to fighting food waste.
              </p>
              <ul className="step-features">
                <li><FiCheckCircle /> Real-time donation tracking</li>
                <li><FiCheckCircle /> Impact statistics</li>
                <li><FiCheckCircle /> Donation history</li>
              </ul>
            </div>
          </div>

          <div className="cta-section">
            <Link to="/auth?tab=register&role=restaurant" className="btn btn-primary btn-large">
              Get Started as a Restaurant
            </Link>
          </div>
        </div>
      </section>

      {/* For NGOs Section */}
      <section className="how-it-works-section alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">For NGOs</h2>
            <p className="section-description">
              Receive quality surplus food from restaurants and feed more beneficiaries. 
              It's free, simple, and makes a real difference.
            </p>
          </div>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <FiMapPin size={32} />
              </div>
              <h3 className="step-title">Register Your Organization</h3>
              <p className="step-description">
                Sign up with your NGO details, location, and dietary requirements. 
                Set up your profile to start receiving food listings.
              </p>
              <ul className="step-features">
                <li><FiCheckCircle /> Quick registration process</li>
                <li><FiCheckCircle /> Set your location</li>
                <li><FiCheckCircle /> Specify dietary needs</li>
              </ul>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <FiBell size={32} />
              </div>
              <h3 className="step-title">Receive Notifications</h3>
              <p className="step-description">
                Get instant SMS notifications when restaurants near you list food that 
                matches your dietary requirements.
              </p>
              <ul className="step-features">
                <li><FiCheckCircle /> Real-time SMS alerts</li>
                <li><FiCheckCircle /> Matched to your needs</li>
                <li><FiCheckCircle /> Nearby restaurants only</li>
              </ul>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <FiPackage size={32} />
              </div>
              <h3 className="step-title">Request Food</h3>
              <p className="step-description">
                Browse available food listings or respond to notifications. Request the 
                food you need, specifying quantity and pickup preferences.
              </p>
              <ul className="step-features">
                <li><FiCheckCircle /> Browse all available food</li>
                <li><FiCheckCircle /> Request specific quantities</li>
                <li><FiCheckCircle /> Add pickup notes</li>
              </ul>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-icon">
                <FiClock size={32} />
              </div>
              <h3 className="step-title">Pickup & Distribute</h3>
              <p className="step-description">
                Once approved, coordinate pickup with the restaurant. Pick up the food 
                at the agreed time and distribute it to your beneficiaries.
              </p>
              <ul className="step-features">
                <li><FiCheckCircle /> Coordinate pickup times</li>
                <li><FiCheckCircle /> Mark as picked up</li>
                <li><FiCheckCircle /> Feed your beneficiaries</li>
              </ul>
            </div>
          </div>

          <div className="cta-section">
            <Link to="/auth?tab=register&role=ngo" className="btn btn-primary btn-large">
              Get Started as an NGO
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="section-title text-center">Why Choose FeedForward?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">⚡</div>
              <h3>Fast & Efficient</h3>
              <p>Real-time matching and instant notifications ensure food reaches those in need quickly.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🌍</div>
              <h3>Location-Based</h3>
              <p>Smart algorithms match food with nearby NGOs, reducing transportation time and costs.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🎯</div>
              <h3>Smart Matching</h3>
              <p>Dietary requirements and preferences are automatically matched for optimal distribution.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">📊</div>
              <h3>Track Impact</h3>
              <p>Monitor your contributions and see the real difference you're making in your community.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🆓</div>
              <h3>Completely Free</h3>
              <p>No fees, no charges. FeedForward is free for both restaurants and NGOs.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔒</div>
              <h3>Secure & Verified</h3>
              <p>All organizations are verified to ensure safe and reliable food distribution.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2 className="section-title text-center">Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3 className="faq-question">Is FeedForward free to use?</h3>
              <p className="faq-answer">
                Yes! FeedForward is completely free for both restaurants and NGOs. 
                There are no registration fees, transaction fees, or hidden charges.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">How quickly are NGOs notified?</h3>
              <p className="faq-answer">
                NGOs receive SMS notifications instantly when a restaurant lists food 
                that matches their location and dietary requirements.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What types of food can be listed?</h3>
              <p className="faq-answer">
                Restaurants can list any surplus food - prepared meals, ingredients, 
                packaged items, etc. The platform supports all food categories.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">How does the matching work?</h3>
              <p className="faq-answer">
                Our algorithm matches food listings with NGOs based on proximity, 
                dietary requirements, and availability. Only relevant matches are notified.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Can I track my donations?</h3>
              <p className="faq-answer">
                Yes! Both restaurants and NGOs can track their activity, including 
                donations made, food received, and impact statistics.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Is my data secure?</h3>
              <p className="faq-answer">
                Absolutely. We use industry-standard security practices to protect 
                your information. All organizations are verified before joining.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Make a Difference?</h2>
          <p className="cta-subtitle">
            Join FeedForward today and be part of the solution to food waste in India.
          </p>
          <div className="cta-buttons">
            <Link to="/auth?tab=register&role=restaurant" className="btn btn-primary btn-large">
              Register as Restaurant
            </Link>
            <Link to="/auth?tab=register&role=ngo" className="btn btn-outline btn-large">
              Register as NGO
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;



