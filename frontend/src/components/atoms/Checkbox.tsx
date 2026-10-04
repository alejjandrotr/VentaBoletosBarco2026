import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', ...props }, ref) => {
    return (
      <label className="flex items-start space-x-3 cursor-pointer group">
        <input
          ref={ref}
          type="checkbox"
          className={`mt-0.5 h-4 w-4 rounded border-[#ACBCBF] bg-white text-[#5289AD] focus:ring-[#5289AD] cursor-pointer ${className}`}
          {...props}
        />
        {(label || description) && (
          <div className="text-sm">
            {label && <span className="font-medium text-[#243C4C] group-hover:text-[#5289AD]">{label}</span>}
            {description && <p className="text-xs text-[#698696] mt-0.5">{description}</p>}
          </div>
        )}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
