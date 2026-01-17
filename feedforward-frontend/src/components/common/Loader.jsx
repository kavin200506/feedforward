import React from 'react';
import './Loader.css';

const Loader = ({ size = 'medium', text, fullScreen = false }) => {
  const loaderClasses = `loader loader-${size}`;

  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className={loaderClasses}>
          <div className="spinner-large"></div>
          {text && <p className="loader-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={loaderClasses}>
      <div className={`spinner ${size === 'large' ? 'spinner-large' : ''}`}></div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;


