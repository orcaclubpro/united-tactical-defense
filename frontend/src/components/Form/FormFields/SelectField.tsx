import React from 'react';
import styled from 'styled-components';
import { useForm } from '../../../contexts/FormContext';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  name: string;
  label: string;
  options: Option[];
  required?: boolean;
  placeholder?: string;
}

const SelectFieldContainer = styled.div`
  margin-bottom: 16px;
  width: 100%;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
  
  &.required::after {
    content: ' *';
    color: #ff4d4f;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
  
  &.error {
    border-color: #ff4d4f;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
`;

const SelectField: React.FC<SelectFieldProps> = ({ 
  name, 
  label, 
  options,
  required = false,
  placeholder = 'Select an option'
}) => {
  const { formData, updateFormData, errors } = useForm();
  const value = formData[name] as string || '';
  const error = errors[name];
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFormData(name, e.target.value);
  };
  
  return (
    <SelectFieldContainer>
      <Label htmlFor={name} className={required ? 'required' : ''}>
        {label}
      </Label>
      <Select
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        className={error ? 'error' : ''}
        required={required}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </SelectFieldContainer>
  );
};

export default SelectField; 