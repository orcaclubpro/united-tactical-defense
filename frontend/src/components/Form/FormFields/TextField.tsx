import React from 'react';
import styled from 'styled-components';
import { useForm } from '../../../contexts/FormContext';

interface TextFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'tel';
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}

const FormGroup = styled.div`
  margin-bottom: 1rem;
  width: 100%;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: #3b82f6;
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }
  
  &.error {
    border-color: #ef4444;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

/**
 * TextField component for form input.
 * Integrates with FormContext to manage state and validation.
 */
const TextField: React.FC<TextFieldProps> = ({ 
  name, 
  label, 
  placeholder = '', 
  type = 'text',
  required = false,
  autoComplete,
  disabled = false
}) => {
  const { formData, updateFormData, errors } = useForm();
  const value = formData[name] || '';
  const error = errors[name];
  const hasError = !!error;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData(name, e.target.value);
  };
  
  return (
    <FormGroup>
      <Label htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value as string}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={hasError ? 'error' : ''}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
        required={required}
      />
      {hasError && (
        <ErrorMessage id={`${name}-error`} role="alert">
          {error}
        </ErrorMessage>
      )}
    </FormGroup>
  );
};

export default TextField; 