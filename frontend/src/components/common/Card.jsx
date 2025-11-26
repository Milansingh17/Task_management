import React from 'react';

const Card = ({ children, className = '', hover = false }) => {
  return (
    <div className={`card ${hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;