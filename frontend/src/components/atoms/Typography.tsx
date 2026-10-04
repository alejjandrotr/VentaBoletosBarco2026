import React from 'react';

export interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({ children, level = 2, className = '' }) => {
  const styles = {
    1: 'text-2xl md:text-3xl font-extrabold text-[#243C4C] tracking-tight',
    2: 'text-xl md:text-2xl font-bold text-[#243C4C] tracking-tight',
    3: 'text-lg font-semibold text-[#243C4C]',
    4: 'text-base font-semibold text-[#243C4C]',
  };

  if (level === 1) return <h1 className={`${styles[1]} ${className}`}>{children}</h1>;
  if (level === 3) return <h3 className={`${styles[3]} ${className}`}>{children}</h3>;
  if (level === 4) return <h4 className={`${styles[4]} ${className}`}>{children}</h4>;
  return <h2 className={`${styles[2]} ${className}`}>{children}</h2>;
};

export interface TextProps {
  children: React.ReactNode;
  variant?: 'body' | 'caption' | 'muted' | 'danger';
  className?: string;
}

export const Text: React.FC<TextProps> = ({ children, variant = 'body', className = '' }) => {
  const styles = {
    body: 'text-sm text-[#243C4C] leading-relaxed',
    caption: 'text-xs text-[#698696] font-medium',
    muted: 'text-xs text-[#698696]',
    danger: 'text-xs text-rose-600 font-medium',
  };

  return <p className={`${styles[variant]} ${className}`}>{children}</p>;
};
