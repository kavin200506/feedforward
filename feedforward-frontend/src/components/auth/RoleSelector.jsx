import React from 'react';
import { USER_ROLES } from '../../utils/constants';
import './RoleSelector.css';

const RoleSelector = ({ selectedRole, onChange }) => {
  return (
    <div className="role-selector">
      <label className="role-label">I am a:</label>
      <div className="role-options">
        <button
          type="button"
          className={`role-option ${selectedRole === USER_ROLES.RESTAURANT ? 'active' : ''}`}
          onClick={() => onChange(USER_ROLES.RESTAURANT)}
        >
          <span className="role-icon">🍽️</span>
          <span className="role-name">Restaurant</span>
        </button>

        <button
          type="button"
          className={`role-option ${selectedRole === USER_ROLES.NGO ? 'active' : ''}`}
          onClick={() => onChange(USER_ROLES.NGO)}
        >
          <span className="role-icon">🤝</span>
          <span className="role-name">NGO/Shelter</span>
        </button>
      </div>
    </div>
  );
};

export default RoleSelector;


