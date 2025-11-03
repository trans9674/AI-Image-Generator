import React from 'react';

const FlipVerticalIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
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
      d="M3 12h18M12 21l-4-4m4 4l4-4m-4-10V3l-4 4m4-4l4 4"
    />
  </svg>
);

export default FlipVerticalIcon;
