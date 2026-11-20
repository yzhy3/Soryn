import React from 'react';
import { BrandMark } from '../atoms/BrandMark';

type BrandHeaderProps = {
  suffix?: React.ReactNode;
};

export const BrandHeader: React.FC<BrandHeaderProps> = ({ suffix }) => (
  <header className="max-w-6xl w-full mx-auto flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <BrandMark />
      <span className="font-bold text-lg tracking-tight text-slate-900">biolink</span>
    </div>
    {suffix}
  </header>
);
