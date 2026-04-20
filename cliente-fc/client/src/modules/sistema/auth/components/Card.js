// Card.js
import React from 'react';

const Card = ({ title, logo, description, onClick }) => {
  return (
    <div  onClick={onClick}>
      <div className="icon-container">
        <img src={logo} alt={`Logo de ${title}`} style={{ width: '50px', height: '50px' }} />
      </div>
      <div className="text-container">
        <h1>{title}</h1>
        <h4>{description}</h4>
      </div>
    </div>
  );
};

export default Card;
