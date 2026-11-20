import React from 'react';

type BrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  muted?: boolean;
};

const sizeClasses = {
  sm: 'w-8 h-8 rounded-xl text-sm',
  md: 'w-9 h-9 rounded-xl text-sm',
  lg: 'w-10 h-10 rounded-2xl text-sm',
};

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 'sm', muted = false }) => (
  <div
    className={`${sizeClasses[size]} ${
      muted
        ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
        : 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
    } flex items-center justify-center font-bold tracking-tight`}
    aria-label="Soryn"
  >
    S
  </div>
);
