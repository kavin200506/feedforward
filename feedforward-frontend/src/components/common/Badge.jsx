import React from 'react';
import './Badge.css';

const Badge = ({
  children,
  variant = 'default',
  size = 'medium',
  color,
  className = '',
  ...props
}) => {
  const badgeClasses = [
    'badge',
    `badge-${variant}`,
    `badge-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const style = color ? { backgroundColor: color, color: '#fff' } : {};

  return (
    <span className={badgeClasses} style={style} {...props}>
      {children}
    </span>
  );
};

export default Badge;


