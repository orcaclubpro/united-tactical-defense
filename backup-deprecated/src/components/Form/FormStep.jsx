import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from '../../contexts/FormContext';

/**
 * FormStep Component
 * 
 * Represents a single step in a multi-step form process.
 * Handles visibility based on current step and manages step validation state.
 */
const FormStep = ({ 
  stepIndex,
  onStepComplete,
  validate,
  children 
}) => {
  const { 
    currentStep,
    formData,
    markStepCompleted
  } = useForm();

  // Determine if this step is active
  const isActive = currentStep === stepIndex;
  
  // Check step validation on mount and when form data changes
  useEffect(() => {
    if (validate && isActive) {
      const isValid = validate(formData);
      markStepCompleted(stepIndex, isValid);
      
      if (onStepComplete) {
        onStepComplete(isValid);
      }
    }
  }, [formData, isActive, markStepCompleted, onStepComplete, stepIndex, validate]);

  // Only render children when step is active
  if (!isActive) {
    return null;
  }

  return (
    <div className="form-step" data-testid={`form-step-${stepIndex}`}>
      {children}
    </div>
  );
};

FormStep.propTypes = {
  /** The index of this step in the multi-step sequence */
  stepIndex: PropTypes.number.isRequired,
  /** Function called when step validation state changes */
  onStepComplete: PropTypes.func,
  /** Function to validate the current step data, should return boolean */
  validate: PropTypes.func,
  /** Step content */
  children: PropTypes.node.isRequired
};

FormStep.defaultProps = {
  onStepComplete: null,
  validate: () => true
};

export default FormStep; 