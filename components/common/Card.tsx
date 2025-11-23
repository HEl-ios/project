
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const baseClasses = "bg-white rounded-xl shadow-lg border border-gray-200/80 overflow-hidden transition-all duration-300 anim-soft";
  const clickableClasses = onClick ? "cursor-pointer hover:shadow-xl hover:-translate-y-1 hover-lift pulse-glow" : "";
  
  return (
    <div className={`${baseClasses} ${clickableClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;