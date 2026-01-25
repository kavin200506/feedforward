import React from 'react';
import { Card, Badge, Button } from '../common';
import { FiMapPin, FiUsers, FiExternalLink } from 'react-icons/fi';
import { useNotification } from '../../context/NotificationContext';
import './NearbyNgosCard.css';

const NearbyNgosCard = ({ registeredNgos = [], unregisteredNgos = [] }) => {
  const { showSuccess, showError } = useNotification();

  const inviteMessage =
    '🍽️ Food available near you! Register on FeedForward to get it: ' +
    `${window.location.origin}/auth?tab=register&role=ngo`;

  const handleInvite = async (ngo) => {
    try {
      const message = `${inviteMessage}\n\nSuggested NGO: ${ngo?.name || 'NGO'}\nGoogle Maps: ${ngo?.mapsUrl || ''}`.trim();

      // Prefer native share on mobile
      if (navigator.share) {
        await navigator.share({
          title: 'FeedForward Invitation',
          text: message,
        });
        showSuccess('Invite shared!');
        return;
      }

      // Fallback: copy to clipboard
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
        showSuccess('Invite message copied to clipboard!');
        return;
      }

      showSuccess('Invite ready. Please copy manually: ' + message);
    } catch (e) {
      showError(e?.message || 'Failed to share invite. Please try again.');
    }
  };

  const getMatchColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 75) return '#8BC34A';
    if (score >= 60) return '#FF9800';
    return '#757575';
  };

  return (
    <div className="nearby-ngos-card">
      {registeredNgos?.length > 0 && (
        <div className="nearby-section">
          <h4 className="nearby-title">✅ Registered NGOs (can request immediately)</h4>
          <div className="nearby-list">
            {registeredNgos.map((ngo, index) => (
              <Card key={ngo.ngoId} className="nearby-item" padding="medium">
                <div className="nearby-rank">{index + 1}</div>
                <div className="nearby-content">
                  <div className="nearby-header">
                    <h5 className="nearby-name">{ngo.name}</h5>
                    <Badge color={getMatchColor(ngo.matchScore)} size="large">
                      {ngo.matchScore}/100
                    </Badge>
                  </div>

                  <div className="nearby-details">
                    <div className="nearby-detail-item">
                      <FiMapPin size={16} />
                      <span>{ngo.distance} km away</span>
                    </div>
                    <div className="nearby-detail-item">
                      <FiUsers size={16} />
                      <span>{ngo.beneficiaries} beneficiaries</span>
                    </div>
                  </div>

                  {ngo.reason && <p className="nearby-reason">{ngo.reason}</p>}

                  <div className="nearby-actions">
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => showSuccess('Request flow for registered NGOs is the next step (coming next).')}
                    >
                      Request Food
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {unregisteredNgos?.length > 0 && (
        <div className="nearby-section">
          <h4 className="nearby-title">📧 Nearby NGOs (Google) — Invite to Join</h4>
          <div className="nearby-list">
            {unregisteredNgos.map((ngo) => (
              <Card key={ngo.placeId} className="nearby-item" padding="medium">
                <div className="nearby-content">
                  <div className="nearby-header">
                    <h5 className="nearby-name">{ngo.name}</h5>
                    {typeof ngo.distanceKm === 'number' && (
                      <Badge color="#4CAF50" size="large">
                        {ngo.distanceKm} km
                      </Badge>
                    )}
                  </div>

                  <div className="nearby-details">
                    {ngo.vicinity && (
                      <div className="nearby-detail-item">
                        <FiMapPin size={16} />
                        <span>{ngo.vicinity}</span>
                      </div>
                    )}
                  </div>

                  <div className="nearby-actions">
                    {ngo.mapsUrl && (
                      <a className="nearby-link" href={ngo.mapsUrl} target="_blank" rel="noreferrer">
                        <FiExternalLink size={14} />
                        View on Maps
                      </a>
                    )}
                    <Button variant="outline" size="small" onClick={() => handleInvite(ngo)}>
                      Invite to Join
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(!registeredNgos || registeredNgos.length === 0) &&
        (!unregisteredNgos || unregisteredNgos.length === 0) && (
          <div className="nearby-empty">No nearby NGOs found.</div>
        )}
    </div>
  );
};

export default NearbyNgosCard;





