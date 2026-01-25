import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { restaurantService, dashboardService } from '../../services';
import { Card, Button, Badge, Skeleton, Modal, Input } from '../../components/common';
import { FiMapPin, FiUsers } from 'react-icons/fi';
import './RestaurantRequests.css';

const RestaurantRequests = () => {
  const { user, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useNotification();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approveModal, setApproveModal] = useState({ open: false, request: null });
  const [rejectModal, setRejectModal] = useState({ open: false, request: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [approveForm, setApproveForm] = useState({
    response: '',
    pickupTime: '',
  });
  const [rejectReason, setRejectReason] = useState('');

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

    fetchRequests();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      if (user && !fetchingRef.current) {
        const now = Date.now();
        if (now - lastFetchTimeRef.current >= FETCH_DEBOUNCE_MS) {
          fetchRequests();
        }
      }
    }, 15000);

    // Refresh when window comes into focus
    const handleFocus = () => {
      if (user && !fetchingRef.current) {
        const now = Date.now();
        if (now - lastFetchTimeRef.current >= FETCH_DEBOUNCE_MS) {
          fetchRequests();
        }
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const fetchRequests = async () => {
    if (fetchingRef.current) return;

    const now = Date.now();
    if (now - lastFetchTimeRef.current < FETCH_DEBOUNCE_MS) return;

    fetchingRef.current = true;
    lastFetchTimeRef.current = now;
    setLoading(true);

    try {
      // Only fetch PENDING requests for the Requests tab
      const requestsData = await restaurantService.getPendingRequests().catch(() => ({ pendingRequests: [] }));
      const pendingRequests = requestsData.pendingRequests || [];
      setRequests(pendingRequests);
    } catch (error) {
      if (error?.status !== 401) {
        showError(error?.message || 'Failed to load requests');
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  const handleApproveClick = (request) => {
    const defaultPickupTime = new Date(Date.now() + 60 * 60 * 1000);
    const formattedTime = defaultPickupTime.toISOString().slice(0, 16);
    
    setApproveForm({
      response: `Your request has been approved. Please pick up the food at the specified time.`,
      pickupTime: formattedTime,
    });
    setApproveModal({ open: true, request });
  };

  const handleRejectClick = (request) => {
    setRejectReason('');
    setRejectModal({ open: true, request });
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!approveForm.pickupTime) {
      showError('Please select a pickup time');
      return;
    }

    setActionLoading(true);
    try {
      await restaurantService.approveRequest(
        approveModal.request.requestId,
        approveForm.response,
        approveForm.pickupTime
      );
      showSuccess('Request approved successfully!');
      setApproveModal({ open: false, request: null });
      setApproveForm({ response: '', pickupTime: '' });
      await fetchRequests();
      // Trigger navbar notification count refresh
      window.dispatchEvent(new Event('refreshNotificationCount'));
    } catch (error) {
      const errorMessage = error?.message || 
                          error?.response?.data?.message || 
                          error?.data?.message ||
                          'Failed to approve request';
      showError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      showError('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      await restaurantService.rejectRequest(
        rejectModal.request.requestId,
        rejectReason
      );
      showSuccess('Request rejected');
      setRejectModal({ open: false, request: null });
      setRejectReason('');
      await fetchRequests();
      // Trigger navbar notification count refresh
      window.dispatchEvent(new Event('refreshNotificationCount'));
    } catch (error) {
      const errorMessage = error?.message || 
                          error?.response?.data?.message || 
                          error?.data?.message ||
                          'Failed to reject request';
      showError(errorMessage);
    } finally {
      setActionLoading(false);
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
    const colors = {
      PENDING: '#FF9800',
      APPROVED: '#2196F3',
      PICKED_UP: '#9C27B0',
      COMPLETED: '#4CAF50',
      REJECTED: '#F44336',
      CANCELLED: '#9E9E9E',
    };
    return colors[status] || '#9E9E9E';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'PENDING',
      APPROVED: 'APPROVED',
      PICKED_UP: 'PICKED UP',
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
          <h1>Food Requests</h1>
        </div>

        {loading ? (
          <Skeleton type="card" height="300px" count={3} />
        ) : requests.length === 0 ? (
          <Card>
            <div className="empty-state">
              <p>No requests at the moment</p>
            </div>
          </Card>
        ) : (
          <div className="requests-list">
            {requests.map((request) => (
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
                  {request.status === 'PENDING' && (
                    <>
                      <Button 
                        variant="success" 
                        size="small"
                        onClick={() => handleApproveClick(request)}
                        disabled={actionLoading}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="small"
                        onClick={() => handleRejectClick(request)}
                        disabled={actionLoading}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Approve Modal */}
        <Modal
          isOpen={approveModal.open}
          onClose={() => setApproveModal({ open: false, request: null })}
          title="Approve Request"
          size="medium"
        >
          <form onSubmit={handleApproveSubmit}>
            <div className="form-section">
              <div className="input-wrapper">
                <label className="input-label">
                  Response Message <span className="input-required">*</span>
                </label>
                <textarea
                  name="response"
                  className="input textarea"
                  value={approveForm.response}
                  onChange={(e) => setApproveForm({ ...approveForm, response: e.target.value })}
                  placeholder="Message to the NGO..."
                  rows={3}
                  required
                />
              </div>

              <Input
                label="Pickup Time"
                type="datetime-local"
                name="pickupTime"
                value={approveForm.pickupTime}
                onChange={(e) => setApproveForm({ ...approveForm, pickupTime: e.target.value })}
                required
                min={new Date().toISOString().slice(0, 16)}
              />

              {approveForm.pickupTime && (
                <div className="info-box" style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: '8px' }}>
                  <small>Pickup scheduled for: {formatDateTime(approveForm.pickupTime)}</small>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setApproveModal({ open: false, request: null })}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={actionLoading}
              >
                Approve Request
              </Button>
            </div>
          </form>
        </Modal>

        {/* Reject Modal */}
        <Modal
          isOpen={rejectModal.open}
          onClose={() => setRejectModal({ open: false, request: null })}
          title="Reject Request"
          size="medium"
        >
          <form onSubmit={handleRejectSubmit}>
            <div className="form-section">
              <div className="input-wrapper">
                <label className="input-label">
                  Reason for Rejection <span className="input-required">*</span>
                </label>
                <textarea
                  name="reason"
                  className="input textarea"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this request..."
                  rows={4}
                  required
                />
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectModal({ open: false, request: null })}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                loading={actionLoading}
              >
                Reject Request
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default RestaurantRequests;
