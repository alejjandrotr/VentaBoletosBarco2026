import React from 'react';
import { Input } from '../atoms/Input';
import type { InputProps } from '../atoms/Input';
import { Text } from '../atoms/Typography';

export interface FormFieldProps extends InputProps {
  label: string;
  required?: boolean;
  helpText?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  helpText,
  id,
  className = '',
  ...inputProps
}) => {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={fieldId} className="block text-xs font-semibold uppercase tracking-wider text-[#243C4C]">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      <Input id={fieldId} error={error} isInvalid={!!error} {...inputProps} />
      {helpText && !error && <Text variant="muted">{helpText}</Text>}
      {error && <Text variant="danger">{error}</Text>}
    </div>
  );
};
