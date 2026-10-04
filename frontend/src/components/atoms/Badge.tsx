import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const variants = {
    success: 'bg-[#5289AD]/20 text-[#243C4C] border-[#5289AD]/50',
    warning: 'bg-[#698696]/25 text-[#243C4C] border-[#698696]/50',
    danger: 'bg-rose-100 text-rose-800 border-rose-300',
    info: 'bg-[#5289AD]/15 text-[#243C4C] border-[#5289AD]/40',
    neutral: 'bg-[#ACBCBF]/35 text-[#243C4C] border-[#ACBCBF]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-bold uppercase tracking-wider',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border border-solid ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};
