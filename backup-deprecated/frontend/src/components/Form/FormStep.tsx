import React, { ReactNode } from 'react';
import { FormStep as FormStepType } from '../../contexts/FormContext';

interface FormStepProps {
  step?: FormStepType;
  isActive?: boolean;
  children: ReactNode;
  onComplete?: () => void;
}

/**
 * FormStep component represents a single step in a multi-step form.
 * It wraps step content and handles visibility based on active status.
 */
const FormStep: React.FC<FormStepProps> = ({ 
  step, 
  isActive = true, 
  children, 
  onComplete 
}) => {
  // Only render children if this step is active
  if (!isActive) {
    return null;
  }

  return (
    <div className="form-step" data-step-id={step?.id}>
      <div className="form-step-content">
        {children}
      </div>
    </div>
  );
};

export default FormStep; 