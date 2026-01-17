import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🍽️</span>
              <span className="logo-text">FeedForward</span>
            </div>
            <p className="footer-tagline">
              Fighting food waste, one meal at a time. Connecting surplus food with those who need it most across India.
            </p>
            <div className="social-links">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FiGithub size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FiTwitter size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FiLinkedin size={20} />
              </a>
              <a href="mailto:contact@feedforward.in" aria-label="Email">
                <FiMail size={20} />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div className="footer-section">
            <h4 className="footer-title">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/for-restaurants">For Restaurants</Link></li>
              <li><Link to="/for-ngos">For NGOs</Link></li>
              <li><Link to="/impact">Impact Report</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/guidelines">Guidelines</Link></li>
              <li><Link to="/help">Help Center</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="footer-section">
            <h4 className="footer-title">Legal</h4>
            <ul className="footer-links">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/cookies">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} FeedForward. Built for HackSprint Season 2.
          </p>
          <p className="footer-built-with">
            Made with ❤️ in India • Powered by React
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


