import React from 'react';
import styled from 'styled-components';
import { useForm } from '../../../contexts/FormContext';

interface CheckboxProps {
  name: string;
  label: string;
  required?: boolean;
}

const CheckboxContainer = styled.div`
  margin-bottom: 16px;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  margin-right: 8px;
  cursor: pointer;
  
  &:focus {
    outline: 2px solid #40a9ff;
  }
`;

const Label = styled.label`
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  
  &.required::after {
    content: ' *';
    color: #ff4d4f;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  margin-left: 24px;
`;

const Checkbox: React.FC<CheckboxProps> = ({ 
  name, 
  label, 
  required = false 
}) => {
  const { formData, updateFormData, errors } = useForm();
  const checked = Boolean(formData[name]);
  const error = errors[name];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData(name, e.target.checked);
  };
  
  return (
    <div>
      <CheckboxContainer>
        <Input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={handleChange}
          required={required}
        />
        <Label htmlFor={name} className={required ? 'required' : ''}>
          {label}
        </Label>
      </CheckboxContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};

export default Checkbox; 