import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  isInvalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, isInvalid = false, ...props }, ref) => {
    const borderStyles = error || isInvalid
      ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500'
      : 'border-[#ACBCBF] focus:border-[#5289AD] focus:ring-[#5289AD]';

    return (
      <input
        ref={ref}
        className={`w-full px-3.5 py-2 bg-white text-[#243C4C] placeholder-[#698696]/70 border rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 text-sm disabled:opacity-50 disabled:bg-[#F4FCFB] ${borderStyles} ${className}`}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
