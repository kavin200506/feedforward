import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services';
import { FiMenu, FiX, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import { USER_ROLES } from '../../utils/constants';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const fetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Fetch notification count for restaurant
  useEffect(() => {
    if (!user || user?.role !== USER_ROLES.RESTAURANT) {
      setNotificationCount(0);
      return;
    }

    const fetchNotificationCount = async () => {
      const now = Date.now();
      if (fetchingRef.current || (now - lastFetchTimeRef.current < 2000)) {
        return;
      }

      fetchingRef.current = true;
      lastFetchTimeRef.current = now;

      try {
        const stats = await dashboardService.getRestaurantStats();
        setNotificationCount(stats.pendingRequests || 0);
      } catch (error) {
        // Silently fail - don't show error for notification count
        console.error('Failed to fetch notification count:', error);
        setNotificationCount(0);
      } finally {
        fetchingRef.current = false;
      }
    };

    fetchNotificationCount();
    
    // Refresh every 15 seconds
    const interval = setInterval(() => {
      if (user && user?.role === USER_ROLES.RESTAURANT && !fetchingRef.current) {
        fetchNotificationCount();
      }
    }, 15000);

    // Refresh on window focus
    const handleFocus = () => {
      if (user && user?.role === USER_ROLES.RESTAURANT) {
        fetchNotificationCount();
      }
    };
    window.addEventListener('focus', handleFocus);

    // Listen for manual refresh events
    const handleRefresh = () => {
      if (user && user?.role === USER_ROLES.RESTAURANT) {
        fetchNotificationCount();
      }
    };
    window.addEventListener('refreshNotificationCount', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('refreshNotificationCount', handleRefresh);
    };
  }, [user, location]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Notification count is now fetched dynamically via useEffect above

  // Safety check for isAuthenticated function
  const checkAuth = isAuthenticated ? isAuthenticated() : false;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">🍽️</span>
            <span className="logo-text">FeedForward</span>

          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-links">
            {!checkAuth ? (
              <>
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                  Home
                </Link>
                <Link to="/how-it-works" className={`nav-link ${isActive('/how-it-works') ? 'active' : ''}`}>
                  How It Works
                </Link>
                <Link to="/impact" className={`nav-link ${isActive('/impact') ? 'active' : ''}`}>
                  Impact
                </Link>
                <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
                  About
                </Link>
              </>
            ) : user?.role === USER_ROLES.RESTAURANT ? (
              <>
                <Link to="/restaurant/dashboard" className={`nav-link ${isActive('/restaurant/dashboard') ? 'active' : ''}`}>
                  Dashboard
                </Link>
                <Link to="/restaurant/listings" className={`nav-link ${isActive('/restaurant/listings') ? 'active' : ''}`}>
                  My Listings
                </Link>
                <Link to="/restaurant/requests" className={`nav-link ${isActive('/restaurant/requests') ? 'active' : ''}`}>
                  Requests
                  {notificationCount > 0 && (
                    <span className="notification-badge">{notificationCount}</span>
                  )}
                </Link>
                <Link to="/restaurant/history" className={`nav-link ${isActive('/restaurant/history') ? 'active' : ''}`}>
                  History
                </Link>
              </>
            ) : user?.role === USER_ROLES.NGO ? (
              <>
                <Link to="/ngo/dashboard" className={`nav-link ${isActive('/ngo/dashboard') ? 'active' : ''}`}>
                  Dashboard
                </Link>
                <Link to="/ngo/browse-food" className={`nav-link ${isActive('/ngo/browse-food') ? 'active' : ''}`}>
                  Browse Food
                </Link>
                <Link to="/ngo/requests" className={`nav-link ${isActive('/ngo/requests') ? 'active' : ''}`}>
                  My Requests
                  {notificationCount > 0 && (
                    <span className="notification-badge">{notificationCount}</span>
                  )}
                </Link>
              </>
            ) : null}

            {checkAuth && (
              <Link to="/impact" className={`nav-link ${isActive('/impact') ? 'active' : ''}`}>
                Impact
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="navbar-actions">
            {!checkAuth ? (
              <>
                <Link to="/auth" className="btn btn-outline btn-small">
                  Login
                </Link>
                <Link to="/auth?tab=register" className="btn btn-primary btn-small">
                  Get Started
                </Link>
              </>
            ) : (
              <div className="user-menu-wrapper">
                <button
                  className="user-menu-trigger"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="User menu"
                >
                  <div className="user-avatar">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user?.name}</span>
                    <span className="user-role">
                      {user?.role === USER_ROLES.RESTAURANT ? 'Restaurant' : 'NGO'}
                    </span>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown slide-down">
                    <div className="dropdown-header">
                      <div className="dropdown-user-info">
                        <div className="user-avatar large">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="dropdown-user-name">{user?.name}</div>
                          <div className="dropdown-user-org">{user?.organizationName}</div>
                        </div>
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <Link to="/profile" className="dropdown-item">
                      <FiUser />
                      <span>Profile</span>
                    </Link>
                    <Link to="/settings" className="dropdown-item">
                      <FiSettings />
                      <span>Settings</span>
                    </Link>

                    <div className="dropdown-divider"></div>

                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <FiLogOut />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu slide-down">
            {!checkAuth ? (
              <>
                <Link to="/" className="mobile-nav-link">Home</Link>
                <Link to="/how-it-works" className="mobile-nav-link">How It Works</Link>
                <Link to="/impact" className="mobile-nav-link">Impact</Link>
                <Link to="/about" className="mobile-nav-link">About</Link>
                <div className="mobile-menu-actions">
                  <Link to="/auth" className="btn btn-outline btn-small">Login</Link>
                  <Link to="/auth?tab=register" className="btn btn-primary btn-small">Get Started</Link>
                </div>
              </>
            ) : user?.role === USER_ROLES.RESTAURANT ? (
              <>
                <Link to="/restaurant/dashboard" className="mobile-nav-link">Dashboard</Link>
                <Link to="/restaurant/listings" className="mobile-nav-link">My Listings</Link>
                <Link to="/restaurant/requests" className="mobile-nav-link">
                  Requests {notificationCount > 0 && `(${notificationCount})`}
                </Link>
                <Link to="/restaurant/history" className="mobile-nav-link">History</Link>
                <Link to="/impact" className="mobile-nav-link">Impact</Link>
                <div className="mobile-menu-divider"></div>
                <Link to="/profile" className="mobile-nav-link">Profile</Link>
                <button className="mobile-nav-link danger" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : user?.role === USER_ROLES.NGO ? (
              <>
                <Link to="/ngo/dashboard" className="mobile-nav-link">Dashboard</Link>
                <Link to="/ngo/browse-food" className="mobile-nav-link">Browse Food</Link>
                <Link to="/ngo/requests" className="mobile-nav-link">
                  My Requests {notificationCount > 0 && `(${notificationCount})`}
                </Link>
                <Link to="/impact" className="mobile-nav-link">Impact</Link>
                <div className="mobile-menu-divider"></div>
                <Link to="/profile" className="mobile-nav-link">Profile</Link>
                <button className="mobile-nav-link danger" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;


