import React, { useState, useEffect } from 'react';
import { Card, Badge } from '../common';
import { useNotification } from '../../context/NotificationContext';
import { FiMapPin, FiPhone, FiClock, FiUsers } from 'react-icons/fi';
import './RequestsPanel.css';

const RequestsPanel = ({ requests, onUpdate, onRequestUpdate }) => {
  const { showSuccess, showError } = useNotification();
  const [localRequests, setLocalRequests] = useState(requests);
  
  // Sync local state with props
  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

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
                {request.status === 'APPROVED' && (
                  <div className="request-status-info">
                    <p style={{ color: '#2196F3', fontSize: '0.9rem', margin: 0, fontWeight: '600' }}>
                      ✅ Auto-Approved - NGO will pick up at scheduled time
                    </p>
                    {request.pickupTime && (
                      <p style={{ color: '#666', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                        Scheduled pickup: {formatDateTime(request.pickupTime)}
                      </p>
                    )}
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

    </>
  );
};

export default RequestsPanel;
