import React from 'react';
import { Card, Badge } from '../common';
import { FiMapPin, FiUsers } from 'react-icons/fi';
import './SuggestedNgosCard.css';

const SuggestedNgosCard = ({ ngos }) => {
  if (!ngos || ngos.length === 0) {
    return null;
  }

  const getMatchColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 75) return '#8BC34A';
    if (score >= 60) return '#FF9800';
    return '#757575';
  };

  return (
    <div className="suggested-ngos-card">
      <h4 className="card-title">Top Matched NGOs:</h4>
      <div className="ngos-list">
        {ngos.map((ngo, index) => (
          <Card key={ngo.ngoId} className="ngo-item" padding="medium">
            <div className="ngo-rank">{index + 1}</div>
            <div className="ngo-content">
              <div className="ngo-header">
                <h5 className="ngo-name">{ngo.name}</h5>
                <Badge
                  color={getMatchColor(ngo.matchScore)}
                  size="large"
                >
                  {ngo.matchScore}/100
                </Badge>
              </div>
              
              <div className="ngo-details">
                <div className="ngo-detail-item">
                  <FiMapPin size={16} />
                  <span>{ngo.distance} km away</span>
                </div>
                <div className="ngo-detail-item">
                  <FiUsers size={16} />
                  <span>{ngo.beneficiaries} beneficiaries</span>
                </div>
              </div>

              <p className="ngo-reason">{ngo.reason}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SuggestedNgosCard;


