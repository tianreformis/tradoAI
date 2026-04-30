import React from 'react';
import { Button as OldButton } from '@/components/ui/button';
import { Input as OldInput } from '@/components/ui/input';

// Stage-4 (fallback): Lightweight adapters that wrap existing internal UI
// components to satisfy Stage 4 goals without requiring a published library.
export const ScadcnButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: any; size?: any; }> = ({ className, ...props }) => {
  return <OldButton className={className} {...props} />;
};

export const ScadcnInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { variant?: any; }> = ({ className, ...props }) => {
  return <OldInput className={className} {...props} />;
};

export default {};
