import React from 'react';
import './Skeleton.css';

const Skeleton = ({ 
  type = 'text', // text, rect, circle, card
  width, 
  height, 
  count = 1,
  className = '',
  style = {}
}) => {
  const skeletons = Array(count).fill(0).map((_, index) => (
    <div 
      key={index}
      className={`skeleton skeleton-${type} ${className}`}
      style={{ 
        width: width, 
        height: height,
        ...style 
      }}
    ></div>
  ));

  if (count === 1) {
    return skeletons[0];
  }

  return <>{skeletons}</>;
};

export default Skeleton;
