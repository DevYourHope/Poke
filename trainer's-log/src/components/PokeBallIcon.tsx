import React from 'react';

interface PokeBallIconProps {
  size?: number;
  className?: string;
}

export const PokeBallIcon = ({ size = 24, className = "" }: PokeBallIconProps) => (
  <div 
    style={{ width: size, height: size }} 
    className={`bg-white rounded-full border-2 border-slate-900 flex items-center justify-center relative shadow-inner overflow-hidden shrink-0 ${className}`}
  >
    <div className="absolute top-0 w-full h-1/2 bg-red-600 border-b border-slate-900"></div>
    <div className="absolute bottom-0 w-full h-1/2 bg-white border-t border-slate-900"></div>
    <div 
      style={{ 
        width: size * 0.3, 
        height: size * 0.3,
        borderWidth: Math.max(1, size * 0.05)
      }} 
      className="bg-white rounded-full border-slate-900 z-10"
    ></div>
  </div>
);

export default PokeBallIcon;
