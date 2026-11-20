import React from 'react';

type StatusDotProps = {
  className?: string;
};

export const StatusDot: React.FC<StatusDotProps> = ({ className = 'bg-sky-500' }) => (
  <span className={`w-2 h-2 rounded-full ${className}`} aria-hidden="true" />
);
