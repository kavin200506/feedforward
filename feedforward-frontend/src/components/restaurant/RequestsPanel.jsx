import React from 'react';
import { Card, Button, Badge } from '../common';
import './RequestsPanel.css';

const RequestsPanel = ({ requests, onUpdate }) => {
  return (
    <div className="requests-panel">
      {requests.map((request) => (
        <Card key={request.requestId} className="request-card">
          <div className="request-header">
            <div>
              <h4 className="request-ngo">{request.ngoName}</h4>
              <p className="request-food">{request.foodName}</p>
            </div>
            <Badge color="#FF9800">PENDING</Badge>
          </div>

          <div className="request-details">
            <div className="detail-item">
              <span className="detail-label">Quantity:</span>
              <span className="detail-value">{request.quantityRequested} servings</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Distance:</span>
              <span className="detail-value">{request.distance} km</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Beneficiaries:</span>
              <span className="detail-value">{request.beneficiaries}</span>
            </div>
          </div>

          <div className="request-actions">
            <Button variant="success" size="small">
              Approve
            </Button>
            <Button variant="outline" size="small">
              Reject
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RequestsPanel;


