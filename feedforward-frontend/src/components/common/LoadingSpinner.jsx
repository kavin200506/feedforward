import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 40, fullScreen = false, text = '' }) => {
  const spinnerStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  const containerClass = fullScreen ? 'loading-spinner-fullscreen' : 'loading-spinner-container';

  return (
    <div className={containerClass}>
      <div className="loading-spinner" style={spinnerStyle}>
        <div className="spinner"></div>
      </div>
      {text && <div className="loading-spinner-text">{text}</div>}
    </div>
  );
};

export default LoadingSpinner;

