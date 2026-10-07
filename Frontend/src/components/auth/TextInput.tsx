import React, { useId } from 'react';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  suffix?: React.ReactNode;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  suffix,
  id,
  className = '',
  value,
  placeholder = ' ',
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="auth-input-group">
      <div className={`auth-input-wrapper ${error ? 'has-error' : ''}`}>
        <input
          id={inputId}
          placeholder={placeholder}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`auth-input-field ${className}`}
          {...props}
        />
        <label htmlFor={inputId} className="auth-floating-label">
          {label}
        </label>
        {suffix && <div className="auth-input-suffix">{suffix}</div>}
      </div>
      {error && (
        <div id={errorId} className="auth-inline-error" role="alert">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
