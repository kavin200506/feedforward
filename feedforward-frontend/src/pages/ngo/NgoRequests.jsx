import React, { useState, useEffect } from 'react';
import { ngoService } from '../../services';
import { useNotification } from '../../context/NotificationContext';
import { Card, Button, Badge, Skeleton } from '../../components/common';
import { FiMapPin, FiPhone, FiClock, FiCheckCircle } from 'react-icons/fi';
import { formatDateTime, getStatusColor } from '../../utils/helpers';
import './NgoRequests.css';

const NgoRequests = () => {
  const { showSuccess, showError } = useNotification();

  const [activeTab, setActiveTab] = useState('active');
  const [requests, setRequests] = useState({
    activeRequests: [],
    completedRequests: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    
    // Auto-refresh every 30 seconds to get updated request statuses
    const interval = setInterval(() => {
      fetchRequests();
    }, 30000); // 30 seconds

    // Refresh when window comes into focus
    const handleFocus = () => {
      fetchRequests();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchRequests = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await ngoService.getMyRequests();
      setRequests(data);
      console.log('Requests fetched:', data);
    } catch (error) {
      if (!silent) {
        showError('Failed to load requests');
      }
      console.error('Fetch requests error:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleMarkPickedUp = async (requestId) => {
    try {
      console.log('Marking request as picked up:', requestId);
      const response = await ngoService.markAsPickedUp(requestId);
      console.log('Mark as picked up response:', response);
      
      // Optimistically update the UI immediately
      setRequests(prev => ({
        ...prev,
        activeRequests: prev.activeRequests.map(req => 
          req.requestId === requestId 
            ? { ...req, status: 'PICKED_UP', pickedUpAt: new Date().toISOString() }
            : req
        )
      }));
      
      showSuccess('Marked as picked up!');
      // Refresh to get latest data from server
      await fetchRequests(true);
    } catch (error) {
      const errorMessage = error?.message || 
                          error?.response?.data?.message || 
                          error?.data?.message ||
                          'Failed to update status';
      console.error('Mark as picked up error:', error);
      showError(errorMessage);
      // Refresh to get correct state from server
      await fetchRequests(true);
    }
  };

  const handleCompleteRequest = async (requestId, quantityReceived) => {
    try {
      await ngoService.completeRequest(requestId, quantityReceived);
      showSuccess('Request completed successfully!');
      fetchRequests();
    } catch (error) {
      showError('Failed to complete request');
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;

    try {
      await ngoService.cancelRequest(requestId);
      showSuccess('Request cancelled');
      fetchRequests();
    } catch (error) {
      showError('Failed to cancel request');
    }
  };

  // if (loading) {
  //   return <Loader fullScreen text="Loading requests..." />;
  // }

  const displayedRequests = activeTab === 'active' 
    ? requests.activeRequests 
    : requests.completedRequests;

  return (
    <div className="ngo-requests-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Requests</h1>
            <p className="page-subtitle">Track and manage your food requests</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="requests-tabs">
          <button
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active ({requests.activeRequests?.length || 0})
          </button>
          <button
            className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({requests.completedRequests?.length || 0})
          </button>
        </div>

        {/* Requests List */}
        <div className="requests-list">
          {loading ? (
             <>
               <Skeleton type="card" height="200px" style={{ marginBottom: '1rem' }} />
               <Skeleton type="card" height="200px" style={{ marginBottom: '1rem' }} />
               <Skeleton type="card" height="200px" style={{ marginBottom: '1rem' }} />
             </>
          ) : displayedRequests && displayedRequests.length > 0 ? (
            displayedRequests.map((request) => (
              <Card key={request.requestId} className="request-card-full">
                <div className="request-card-header">
                  <div className="request-main-info">
                    <h3 className="request-food-title">{request.foodName}</h3>
                    <p className="request-restaurant-name">from {request.restaurantName}</p>
                  </div>
                  <Badge color={getStatusColor(request.status)} size="large">
                    {request.status}
                  </Badge>
                </div>

                <div className="request-details-grid">
                  <div className="detail-column">
                    <div className="detail-row">
                      <span className="detail-icon">📦</span>
                      <div>
                        <span className="detail-label">Quantity</span>
                        <span className="detail-value">{request.quantityRequested} servings</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <FiClock className="detail-icon" />
                      <div>
                        <span className="detail-label">Requested On</span>
                        <span className="detail-value">{formatDateTime(request.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {request.status === 'APPROVED' && (
                    <div className="detail-column pickup-details">
                      <h4 className="pickup-title">Pickup Details:</h4>
                      <div className="detail-row">
                        <FiMapPin className="detail-icon" />
                        <div>
                          <span className="detail-label">Address</span>
                          <span className="detail-value">{request.restaurantAddress}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <FiPhone className="detail-icon" />
                        <div>
                          <span className="detail-label">Contact</span>
                          <span className="detail-value">{request.restaurantPhone}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <FiClock className="detail-icon" />
                        <div>
                          <span className="detail-label">Time Window</span>
                          <span className="detail-value">{request.pickupTime}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {request.status === 'COMPLETED' && (
                    <div className="detail-column">
                      <div className="detail-row">
                        <FiCheckCircle className="detail-icon" style={{ color: 'var(--color-success)' }} />
                        <div>
                          <span className="detail-label">Completed On</span>
                          <span className="detail-value">{formatDateTime(request.completedAt)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="request-actions">
                  {request.status === 'PENDING' && (
                    <>
                      <Button variant="outline" size="small" onClick={() => handleCancelRequest(request.requestId)}>
                        Cancel Request
                      </Button>
                    </>
                  )}

                  {request.status === 'APPROVED' && (
                    <>
                      <Button variant="outline" size="small">
                        Get Directions
                      </Button>
                      <Button 
                        variant="primary" 
                        size="small"
                        onClick={() => handleMarkPickedUp(request.requestId)}
                      >
                        Mark as Picked Up
                      </Button>
                    </>
                  )}

                  {request.status === 'PICKED_UP' && (
                    <Button 
                      variant="success" 
                      size="small"
                      onClick={() => handleCompleteRequest(request.requestId, request.quantityRequested)}
                    >
                      Complete Request
                    </Button>
                  )}

                  {request.status === 'COMPLETED' && (
                    <Button variant="outline" size="small">
                      Rate Restaurant
                    </Button>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <div className="empty-state">
                <div className="empty-icon">
                  {activeTab === 'active' ? '📦' : '✅'}
                </div>
                <h3>
                  {activeTab === 'active' 
                    ? 'No active requests' 
                    : 'No completed requests yet'}
                </h3>
                <p>
                  {activeTab === 'active'
                    ? 'Browse available food to create your first request'
                    : 'Completed requests will appear here'}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default NgoRequests;
