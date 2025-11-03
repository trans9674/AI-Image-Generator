import React from 'react';

const CropIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    strokeWidth={2}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M8 9l3 3-3 3m5 0h3M9 12h10" 
    />
     <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M14.001 5V2.999M14.001 21v-2.001M5 14H3M21 14h-2.001" 
     />
  </svg>
);

export default CropIcon;
