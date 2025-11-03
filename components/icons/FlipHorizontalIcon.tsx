import React from 'react';

const FlipHorizontalIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
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
      d="M12 21V3m0 9h9m-9 0H3l4-4M3 12l4 4"
    />
  </svg>
);

export default FlipHorizontalIcon;
