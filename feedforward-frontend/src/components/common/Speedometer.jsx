import React from 'react';
import './Speedometer.css';

const Speedometer = ({ value, label, max = 100, suffix = '', size = 200, color = 'var(--color-primary)' }) => {
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Semi-circle
  
  // Calculate specific percentage for visual purposes
  // If max is not provided or 0, we'll just show full or random for effect
  // For impact metrics that grow indefinitely, "max" is arbitrary. 
  // We'll use a visual fill of around 75% to look good, or calculate if max exists.
  let percentage = 75; 
  if (max && value) {
    percentage = Math.min((value / max) * 100, 100);
  }

  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="speedometer-container" style={{ width: size, height: size / 1.6 }}>
      <div className="speedometer-gauge">
        <svg height={size / 1.8} width={size} viewBox={`0 0 ${size} ${size / 1.8}`}>
          <defs>
            <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: color, stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Background Track */}
          <path
            d={`M ${strokeWidth / 2},${size / 2} a ${radius},${radius} 0 1,1 ${size - strokeWidth},0`}
            fill="none"
            stroke="#e6e6e6"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Value Track */}
          <path
            d={`M ${strokeWidth / 2},${size / 2} a ${radius},${radius} 0 1,1 ${size - strokeWidth},0`}
            fill="none"
            stroke={`url(#grad-${label})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference} // Total length
            strokeDashoffset={strokeDashoffset}
            className="speedometer-fill"
          />
        </svg>
        
        <div className="speedometer-content">
          <span className="speedometer-value" style={{ color: color }}>
            {value ? value.toLocaleString() : '0'}{suffix}
          </span>
          <span className="speedometer-label">{label}</span>
        </div>
      </div>
    </div>
  );
};

export default Speedometer;
