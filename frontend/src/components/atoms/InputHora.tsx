import React from 'react';

export interface InputHoraProps {
  value: string; // 'HH:mm'
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export const InputHora: React.FC<InputHoraProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  error,
}) => {
  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="time"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 text-sm font-semibold rounded-lg border transition-colors focus:outline-none focus:ring-2 bg-white text-[#243C4C] ${
            error
              ? 'border-rose-400 focus:ring-rose-400'
              : 'border-[#ACBCBF] focus:ring-[#5289AD] focus:border-[#5289AD]'
          } disabled:bg-slate-100 disabled:cursor-not-allowed ${className}`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
