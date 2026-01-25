import React from 'react';
import './Loader.css';

const Loader = ({ size = 'medium', text, fullScreen = false }) => {
  const loaderClasses = `loader loader-${size}`;
  
  const loadingDots = (
    <div className="loading-dots">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className={loaderClasses}>
          {loadingDots}
          {text && <p className="loader-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={loaderClasses}>
      {loadingDots}
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;


