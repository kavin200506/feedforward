import React, { useId } from 'react';
import './Input.css';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  icon,
  required = false,
  disabled = false,
  className = '',
  name,
  id,
  ...props
}) => {
  // Generate unique ID if not provided
  const generatedId = useId();
  const inputId = id || (name ? `input-${name}` : `input-${generatedId}`);
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText && !error ? `${inputId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}

      <div className="input-container">
        {icon && <span className="input-icon" aria-hidden="true">{icon}</span>}
        <input
          type={type}
          id={inputId}
          name={name}
          className={`input ${error ? 'input-error' : ''} ${icon ? 'input-with-icon' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          {...props}
        />
      </div>

      {error && (
        <span id={errorId} className="input-error-message shake" role="alert">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span id={helperId} className="input-helper-text">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Input;


