import React from 'react';
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
  ...props
}) => {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}

      <div className="input-container">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={type}
          className={`input ${error ? 'input-error' : ''} ${icon ? 'input-with-icon' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          {...props}
        />
      </div>

      {error && <span className="input-error-message shake">{error}</span>}
      {helperText && !error && <span className="input-helper-text">{helperText}</span>}
    </div>
  );
};

export default Input;


