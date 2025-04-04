import { useState, useEffect, useCallback } from 'react';
import { useForm, FormData, FormErrors, FormStep } from '../contexts/FormContext';
import { FormValidator } from '../services/validation/formValidator';

interface UseFormValidationProps {
  validator: FormValidator;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormValidationReturn {
  errors: FormErrors;
  validateField: (fieldName: string) => boolean;
  validateStep: (stepIndex?: number) => boolean;
  validateForm: () => boolean;
  resetValidation: () => void;
  isValid: boolean;
  touchedFields: Record<string, boolean>;
  setTouched: (fieldName: string) => void;
}

const useFormValidation = ({
  validator,
  validateOnChange = true,
  validateOnBlur = true
}: UseFormValidationProps): UseFormValidationReturn => {
  const {
    formData,
    errors: contextErrors,
    setErrors,
    currentStepIndex,
    steps,
    validateStep: contextValidateStep
  } = useForm();
  
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState<boolean>(true);
  
  // Set a field as touched (for blur validation)
  const setTouched = useCallback((fieldName: string) => {
    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
    
    if (validateOnBlur) {
      validateField(fieldName);
    }
  }, [validateOnBlur]);
  
  // Validate a single field
  const validateField = useCallback((fieldName: string): boolean => {
    const error = validator.validateField(fieldName, formData);
    
    // Create new errors object
    const updatedErrors: FormErrors = { ...contextErrors };
    if (error) {
      updatedErrors[fieldName] = error;
    } else {
      delete updatedErrors[fieldName];
    }
    setErrors(updatedErrors);
    
    return !error;
  }, [formData, contextErrors, setErrors, validator]);
  
  // Validate current step or specified step
  const validateStep = useCallback((stepIndex: number = currentStepIndex): boolean => {
    const step = steps[stepIndex];
    if (!step) return true;
    
    const stepErrors = validator.validateStep(step.fields, formData);
    
    // Create new errors object
    const updatedErrors: FormErrors = { ...contextErrors };
    
    // Remove all errors for current step fields
    step.fields.forEach(field => {
      delete updatedErrors[field];
    });
    
    // Add new errors
    Object.assign(updatedErrors, stepErrors);
    
    setErrors(updatedErrors);
    
    const isStepValid = Object.keys(stepErrors).length === 0;
    setIsValid(isStepValid);
    
    return isStepValid;
  }, [currentStepIndex, formData, contextErrors, setErrors, steps, validator]);
  
  // Validate the entire form
  const validateForm = useCallback((): boolean => {
    const allErrors = validator.validate(formData);
    
    setErrors(allErrors);
    
    const isFormValid = Object.keys(allErrors).length === 0;
    setIsValid(isFormValid);
    
    return isFormValid;
  }, [formData, setErrors, validator]);
  
  // Reset validation state
  const resetValidation = useCallback(() => {
    setErrors({});
    setTouchedFields({});
    setIsValid(true);
  }, [setErrors]);
  
  // Update validation when form data changes
  useEffect(() => {
    if (validateOnChange) {
      const touchedFieldNames = Object.keys(touchedFields).filter(key => touchedFields[key]);
      
      // Only validate fields that have been touched
      if (touchedFieldNames.length > 0) {
        const updatedErrors: FormErrors = { ...contextErrors };
        
        touchedFieldNames.forEach(fieldName => {
          const error = validator.validateField(fieldName, formData);
          if (error) {
            updatedErrors[fieldName] = error;
          } else {
            delete updatedErrors[fieldName];
          }
        });
        
        setErrors(updatedErrors);
        
        const hasErrors = touchedFieldNames.some(field => !!updatedErrors[field]);
        setIsValid(!hasErrors);
      }
    }
  }, [formData, contextErrors, setErrors, touchedFields, validateOnChange, validator]);
  
  // Export validation methods and state
  return {
    errors: contextErrors,
    validateField,
    validateStep,
    validateForm,
    resetValidation,
    isValid,
    touchedFields,
    setTouched
  };
};

export default useFormValidation; 