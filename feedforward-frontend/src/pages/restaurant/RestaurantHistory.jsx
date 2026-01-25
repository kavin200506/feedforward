import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { restaurantService } from '../../services';
import { Card, Badge, Skeleton } from '../../components/common';
import { FiMapPin, FiUsers } from 'react-icons/fi';
import './RestaurantRequests.css';

const RestaurantHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const { showError } = useNotification();

  const [historyRequests, setHistoryRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prevent duplicate API calls
  const fetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const FETCH_DEBOUNCE_MS = 1000;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const now = Date.now();
    if (fetchingRef.current || (now - lastFetchTimeRef.current < FETCH_DEBOUNCE_MS)) {
      return;
    }

    fetchHistory();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      if (user && !fetchingRef.current) {
        const now = Date.now();
        if (now - lastFetchTimeRef.current >= FETCH_DEBOUNCE_MS) {
          fetchHistory();
        }
      }
    }, 15000);

    // Refresh when window comes into focus
    const handleFocus = () => {
      if (user && !fetchingRef.current) {
        const now = Date.now();
        if (now - lastFetchTimeRef.current >= FETCH_DEBOUNCE_MS) {
          fetchHistory();
        }
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const fetchHistory = async () => {
    if (fetchingRef.current) return;

    const now = Date.now();
    if (now - lastFetchTimeRef.current < FETCH_DEBOUNCE_MS) return;

    fetchingRef.current = true;
    lastFetchTimeRef.current = now;
    setLoading(true);

    try {
      // Get all requests and filter for APPROVED and PICKED_UP (history)
      const allRequestsData = await restaurantService.getAllRequests().catch(() => ({ allRequests: [] }));
      const allRequests = allRequestsData.allRequests || [];
      
      // Filter for APPROVED and PICKED_UP requests (these are the history)
      const history = allRequests.filter(r => 
        r.status === 'APPROVED' || r.status === 'PICKED_UP'
      );
      
      // Sort by date (newest first)
      history.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.approvedAt || 0);
        const dateB = new Date(b.createdAt || b.approvedAt || 0);
        return dateB - dateA;
      });
      
      setHistoryRequests(history);
    } catch (error) {
      if (error?.status !== 401) {
        showError(error?.message || 'Failed to load history');
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    if (status === 'PENDING' || status === 'PICKED_UP') {
      return '#2196F3';
    }
    const colors = {
      APPROVED: '#2196F3',
      COMPLETED: '#4CAF50',
      REJECTED: '#F44336',
      CANCELLED: '#9E9E9E',
    };
    return colors[status] || '#9E9E9E';
  };

  const getStatusLabel = (status) => {
    if (status === 'PENDING' || status === 'PICKED_UP') {
      return 'APPROVED';
    }
    const labels = {
      APPROVED: 'APPROVED',
      COMPLETED: 'COMPLETED',
      REJECTED: 'REJECTED',
      CANCELLED: 'CANCELLED',
    };
    return labels[status] || status;
  };

  if (authLoading) {
    return <div className="container"><Skeleton type="card" height="400px" /></div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="restaurant-requests-page">
      <div className="container">
        <div className="page-header">
          <h1>Donation History</h1>
        </div>

        {loading ? (
          <Skeleton type="card" height="300px" count={3} />
        ) : historyRequests.length === 0 ? (
          <Card>
            <div className="empty-state">
              <p>No donation history yet</p>
            </div>
          </Card>
        ) : (
          <div className="requests-list">
            {historyRequests.map((request) => (
              <Card key={request.requestId} className="request-card">
                <div className="request-header">
                  <div>
                    <h4 className="request-ngo">{request.ngoName || 'NGO'}</h4>
                    <p className="request-food">{request.foodName}</p>
                  </div>
                  <Badge color={getStatusColor(request.status)}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </div>

                <div className="request-details">
                  <div className="detail-item">
                    <span className="detail-label">Quantity:</span>
                    <span className="detail-value">{request.quantityRequested} servings</span>
                  </div>
                  {request.distance && (
                    <div className="detail-item">
                      <FiMapPin size={14} />
                      <span className="detail-value">{request.distance} km away</span>
                    </div>
                  )}
                  {request.beneficiaries && (
                    <div className="detail-item">
                      <FiUsers size={14} />
                      <span className="detail-value">{request.beneficiaries} beneficiaries</span>
                    </div>
                  )}
                  {request.urgencyLevel && (
                    <div className="detail-item">
                      <span className="detail-label">Urgency:</span>
                      <span className="detail-value">{request.urgencyLevel}</span>
                    </div>
                  )}
                </div>

                <div className="request-actions">
                  {(request.status === 'APPROVED' || request.status === 'PICKED_UP') && (
                    <div className="request-status-info">
                      <p style={{ color: '#2196F3', fontSize: '0.9rem', margin: 0, fontWeight: '600' }}>
                        ✅ Auto-Approved - NGO will pick up at scheduled time
                      </p>
                      {request.pickupTime && (
                        <p style={{ color: '#666', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                          Scheduled pickup: {formatDateTime(request.pickupTime)}
                        </p>
                      )}
                      {request.status === 'PICKED_UP' && request.pickedUpAt && (
                        <>
                          <p style={{ color: '#666', fontSize: '0.85rem', margin: '0.5rem 0 0 0' }}>
                            ✅ Accepted - NGO has picked up the food
                          </p>
                          <p style={{ color: '#666', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                            Picked up at: {formatDateTime(request.pickedUpAt)}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantHistory;
