import React from 'react';
import styled from 'styled-components';
import { useForm } from '../../contexts/FormContext';

const SummaryContainer = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  background-color: #fafafa;
`;

const SummaryRow = styled.div`
  display: flex;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FieldLabel = styled.div`
  font-weight: 500;
  width: 40%;
  color: #666;
  font-size: 14px;
`;

const FieldValue = styled.div`
  width: 60%;
  font-size: 14px;
`;

const EmptyValue = styled.span`
  color: #bfbfbf;
  font-style: italic;
`;

interface FormSummaryProps {
  excludeFields?: string[];
}

const FormSummary: React.FC<FormSummaryProps> = ({ 
  excludeFields = [] 
}) => {
  const { formData } = useForm();
  
  // Format field name for display
  const formatFieldName = (fieldName: string): string => {
    return fieldName
      // Split on camelCase
      .replace(/([A-Z])/g, ' $1')
      // Split on snake_case
      .replace(/_/g, ' ')
      // Capitalize first letter
      .replace(/^./, str => str.toUpperCase());
  };
  
  // Format field value for display
  const formatFieldValue = (fieldName: string, value: any): React.ReactNode => {
    if (value === undefined || value === null || value === '') {
      return <EmptyValue>Not provided</EmptyValue>;
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    return String(value);
  };
  
  // Filter out excluded fields and boolean false values
  const fieldsToDisplay = Object.entries(formData)
    .filter(([fieldName, value]) => 
      !excludeFields.includes(fieldName) && 
      // Don't display false boolean values in summary
      !(typeof value === 'boolean' && !value)
    );
  
  if (fieldsToDisplay.length === 0) {
    return (
      <SummaryContainer>
        <EmptyValue>No information provided yet</EmptyValue>
      </SummaryContainer>
    );
  }
  
  return (
    <SummaryContainer>
      {fieldsToDisplay.map(([fieldName, value]) => (
        <SummaryRow key={fieldName}>
          <FieldLabel>{formatFieldName(fieldName)}:</FieldLabel>
          <FieldValue>{formatFieldValue(fieldName, value)}</FieldValue>
        </SummaryRow>
      ))}
    </SummaryContainer>
  );
};

export default FormSummary; 