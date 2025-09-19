import React from 'react';
import './Input.css';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  className?: string;
  autoComplete?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  name,
  id,
  disabled = false,
  required = false,
  error,
  label,
  className = '',
  autoComplete,
}) => {
  const inputId = id || name;
  const hasError = !!error;

  const inputClasses = [
    'input',
    hasError ? 'input-error' : '',
    disabled ? 'input-disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="input-container">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        className={inputClasses}
      />
      {error && (
        <div className="input-error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;
