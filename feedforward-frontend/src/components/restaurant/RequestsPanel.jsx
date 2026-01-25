import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Input } from '../common';
import { restaurantService } from '../../services';
import { useNotification } from '../../context/NotificationContext';
import { FiMapPin, FiPhone, FiClock, FiUsers } from 'react-icons/fi';
import './RequestsPanel.css';

const RequestsPanel = ({ requests, onUpdate, onRequestUpdate }) => {
  const { showSuccess, showError } = useNotification();
  const [approveModal, setApproveModal] = useState({ open: false, request: null });
  const [rejectModal, setRejectModal] = useState({ open: false, request: null });
  const [loading, setLoading] = useState(false);
  const [approveForm, setApproveForm] = useState({
    response: '',
    pickupTime: '',
  });
  const [rejectReason, setRejectReason] = useState('');
  const [localRequests, setLocalRequests] = useState(requests);
  
  // Sync local state with props
  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

  const handleApproveClick = (request) => {
    // Set default pickup time to 1 hour from now
    const defaultPickupTime = new Date(Date.now() + 60 * 60 * 1000);
    const formattedTime = defaultPickupTime.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    
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

    const requestId = approveModal.request.requestId;
    
    // Optimistically update the UI immediately
    setLocalRequests(prev => prev.map(req => 
      req.requestId === requestId 
        ? { 
            ...req, 
            status: 'APPROVED',
            response: approveForm.response,
            pickupTime: approveForm.pickupTime,
            approvedAt: new Date().toISOString()
          }
        : req
    ));
    
    // Update parent component immediately
    if (onRequestUpdate) {
      onRequestUpdate(requestId, {
        status: 'APPROVED',
        response: approveForm.response,
        pickupTime: approveForm.pickupTime,
        approvedAt: new Date().toISOString()
      });
    }

    setLoading(true);
    try {
      await restaurantService.approveRequest(
        requestId,
        approveForm.response,
        approveForm.pickupTime
      );
      showSuccess('Request approved successfully!');
      setApproveModal({ open: false, request: null });
      setApproveForm({ response: '', pickupTime: '' });
      // Refresh to get latest data from server (silent refresh)
      if (onUpdate) {
        setTimeout(() => onUpdate(), 500);
      }
    } catch (error) {
      // Revert optimistic update on error
      setLocalRequests(prev => prev.map(req => 
        req.requestId === requestId 
          ? approveModal.request // Restore original request
          : req
      ));
      
      // Revert parent component
      if (onRequestUpdate) {
        onRequestUpdate(requestId, approveModal.request);
      }
      
      const errorMessage = error?.message || 
                          error?.response?.data?.message || 
                          error?.data?.message ||
                          'Failed to approve request';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      showError('Please provide a reason for rejection');
      return;
    }

    const requestId = rejectModal.request.requestId;
    
    // Optimistically update the UI immediately
    setLocalRequests(prev => prev.map(req => 
      req.requestId === requestId 
        ? { 
            ...req, 
            status: 'REJECTED',
            rejectionReason: rejectReason,
            rejectedAt: new Date().toISOString()
          }
        : req
    ));
    
    // Update parent component immediately
    if (onRequestUpdate) {
      onRequestUpdate(requestId, {
        status: 'REJECTED',
        rejectionReason: rejectReason,
        rejectedAt: new Date().toISOString()
      });
    }

    setLoading(true);
    try {
      await restaurantService.rejectRequest(
        requestId,
        rejectReason
      );
      showSuccess('Request rejected');
      setRejectModal({ open: false, request: null });
      setRejectReason('');
      // Refresh to get latest data from server (silent refresh)
      if (onUpdate) {
        setTimeout(() => onUpdate(), 500);
      }
    } catch (error) {
      // Revert optimistic update on error
      setLocalRequests(prev => prev.map(req => 
        req.requestId === requestId 
          ? rejectModal.request // Restore original request
          : req
      ));
      
      // Revert parent component
      if (onRequestUpdate) {
        onRequestUpdate(requestId, rejectModal.request);
      }
      
      const errorMessage = error?.message || 
                          error?.response?.data?.message || 
                          error?.data?.message ||
                          'Failed to reject request';
      showError(errorMessage);
    } finally {
      setLoading(false);
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

  return (
    <>
      <div className="requests-panel">
        {localRequests.length === 0 ? (
          <Card>
            <div className="empty-state">
              <p>No requests at the moment</p>
            </div>
          </Card>
        ) : (
          localRequests.map((request) => (
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
                {request.notes && (
                  <div className="detail-item">
                    <span className="detail-label">Notes:</span>
                    <span className="detail-value">{request.notes}</span>
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
                      disabled={loading}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="small"
                      onClick={() => handleRejectClick(request)}
                      disabled={loading}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {request.status === 'APPROVED' && (
                  <div className="request-status-info">
                    <p style={{ color: '#2196F3', fontSize: '0.9rem', margin: 0 }}>
                      ✅ Waiting for NGO to pick up
                    </p>
                  </div>
                )}
                {request.status === 'PICKED_UP' && (
                  <div className="request-status-info">
                    <p style={{ color: '#9C27B0', fontSize: '0.9rem', margin: 0, fontWeight: '600' }}>
                      ✅ Accepted - NGO has picked up the food
                    </p>
                    {request.pickedUpAt && (
                      <p style={{ color: '#666', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                        Picked up at: {formatDateTime(request.pickedUpAt)}
                      </p>
                    )}
                  </div>
                )}
                {request.status === 'COMPLETED' && (
                  <div className="request-status-info">
                    <p style={{ color: '#4CAF50', fontSize: '0.9rem', margin: 0, fontWeight: '600' }}>
                      ✅ Donation completed successfully
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

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
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
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
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={loading}
            >
              Reject Request
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default RequestsPanel;
