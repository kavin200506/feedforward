import React from 'react';
import { Card, Badge } from '../common';
import { formatTimeRemaining, calculateUrgency, getStatusColor } from '../../utils/helpers';
import './FoodListingsTable.css';

const FoodListingsTable = ({ listings, onUpdate }) => {
  return (
    <Card padding="none">
      <div className="table-wrapper">
        <table className="listings-table">
          <thead>
            <tr>
              <th>Food Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Expires In</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => {
              const urgency = calculateUrgency(listing.expiryTime);
              return (
                <tr key={listing.listingId}>
                  <td className="food-name">{listing.foodName}</td>
                  <td>{listing.category}</td>
                  <td>{listing.quantity} {listing.unit}</td>
                  <td>
                    <span style={{ color: urgency.color, fontWeight: 500 }}>
                      {formatTimeRemaining(listing.expiryTime)}
                    </span>
                  </td>
                  <td>
                    <Badge color={getStatusColor(listing.status)}>
                      {listing.status}
                    </Badge>
                  </td>
                  <td>
                    <button className="action-link">View</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default FoodListingsTable;


