import React from 'react';
import './Card.css';

const Card = ({
  children,
  hover = false,
  padding = 'medium',
  className = '',
  onClick,
  ...props
}) => {
  const cardClasses = [
    'card',
    `card-padding-${padding}`,
    hover ? 'card-hover' : '',
    onClick ? 'card-clickable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;


