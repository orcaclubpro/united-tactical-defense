import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// FormFieldValue can be any type of form field value
export type FormFieldValue = string | number | boolean | Date | null;

// FormData is a record of field names to their values
export interface FormData {
  [key: string]: any;
}

// FormErrors tracks validation errors by field name
export interface FormErrors {
  [key: string]: string;
}

// Step validation status
export interface StepValidation {
  isValid: boolean;
  errors: FormErrors;
}

// Form step configuration
export interface FormStep {
  id: string;
  title: string;
  fields: string[];
  optional?: boolean;
}

export interface FormState {
  currentStep: number;
  steps: string[];
  data: FormData;
  errors: FormErrors;
  isSubmitting: boolean;
  isSubmitted: boolean;
  isValid: boolean;
}

// Context interface
interface FormContextType {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  validateStep: (stepName: string) => boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  updateFormData: (dataOrKey: FormData | string, value?: FormFieldValue) => void;
  submitForm: () => Promise<any>;
  resetForm: () => void;
  
  // Additional properties that components are expecting
  formData: FormData;
  errors: FormErrors;
  setErrors: (errors: FormErrors) => void;
  currentStepIndex: number;
  currentStep: FormStep;
  steps: FormStep[];
  isFirstStep: boolean;
  isLastStep: boolean;
  goToStep: (stepIndex: number) => void;
}

// Default values for the context
const defaultFormState: FormState = {
  currentStep: 0,
  steps: ['contact', 'appointment', 'summary'],
  data: {},
  errors: {},
  isSubmitting: false,
  isSubmitted: false,
  isValid: false
};

// Create context
export const FormContext = createContext<FormContextType>({
  formState: defaultFormState,
  setFormState: () => {},
  validateStep: () => false,
  goToNextStep: () => {},
  goToPreviousStep: () => {},
  updateFormData: () => {},
  submitForm: async () => ({}),
  resetForm: () => {},
  
  // Additional properties
  formData: {},
  errors: {},
  setErrors: () => {},
  currentStepIndex: 0,
  currentStep: { id: '', title: '', fields: [] },
  steps: [],
  isFirstStep: true,
  isLastStep: true,
  goToStep: () => {}
});

// Add FormProvider component
export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formState, setFormState] = useState<FormState>({
    currentStep: 0,
    steps: ['contact', 'appointment', 'summary'],
    data: {},
    errors: {},
    isSubmitting: false,
    isSubmitted: false,
    isValid: false
  });

  // Update form data 
  const updateFormData = (dataOrKey: FormData | string, value?: FormFieldValue) => {
    if (typeof dataOrKey === 'string' && value !== undefined) {
      // Handle key-value pair
      setFormState(prevState => ({
        ...prevState,
        data: {
          ...prevState.data,
          [dataOrKey]: value
        }
      }));
    } else if (typeof dataOrKey === 'object') {
      // Handle object of changes
      setFormState(prevState => ({
        ...prevState,
        data: {
          ...prevState.data,
          ...dataOrKey
        }
      }));
    }
  };

  // Go to next step
  const goToNextStep = () => {
    if (formState.currentStep < formState.steps.length - 1) {
      setFormState(prevState => ({
        ...prevState,
        currentStep: prevState.currentStep + 1,
        // Clear errors when moving to next step
        errors: {}
      }));
    }
  };

  // Go to previous step
  const goToPreviousStep = () => {
    if (formState.currentStep > 0) {
      setFormState(prevState => ({
        ...prevState,
        currentStep: prevState.currentStep - 1,
        // Clear errors when moving to previous step
        errors: {}
      }));
    }
  };

  // Validate the current step
  const validateStep = (stepName: string): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Different validation for different steps
    switch (stepName) {
      case 'contact':
        const nameValue = formState.data.name;
        const emailValue = formState.data.email;
        const phoneValue = formState.data.phone;

        if (!nameValue || (typeof nameValue === 'string' && nameValue.trim() === '')) {
          errors.name = 'Name is required';
          isValid = false;
        }

        if (!emailValue || (typeof emailValue === 'string' && emailValue.trim() === '')) {
          errors.email = 'Email is required';
          isValid = false;
        } else if (
          typeof emailValue === 'string' && 
          !/\S+@\S+\.\S+/.test(emailValue)
        ) {
          errors.email = 'Email is invalid';
          isValid = false;
        }

        if (!phoneValue || (typeof phoneValue === 'string' && phoneValue.trim() === '')) {
          errors.phone = 'Phone is required';
          isValid = false;
        }
        break;

      case 'appointment':
        if (!formState.data.appointmentDate) {
          errors.appointmentDate = 'Please select a date';
          isValid = false;
        }
        if (!formState.data.appointmentTime) {
          errors.appointmentTime = 'Please select a time slot';
          isValid = false;
        }
        break;

      // Add other steps validation as needed
    }

    // Update form state with errors
    setFormState(prevState => ({
      ...prevState,
      errors,
      isValid
    }));

    return isValid;
  };

  // Submit the form
  const submitForm = async () => {
    setFormState(prevState => ({
      ...prevState,
      isSubmitting: true
    }));

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mark form as submitted
      setFormState(prevState => ({
        ...prevState,
        isSubmitting: false,
        isSubmitted: true
      }));

      return true;
    } catch (error) {
      setFormState(prevState => ({
        ...prevState,
        isSubmitting: false,
        errors: {
          ...prevState.errors,
          form: 'An error occurred while submitting the form. Please try again.'
        }
      }));

      return false;
    }
  };

  // Reset the form
  const resetForm = () => {
    setFormState({
      currentStep: 0,
      steps: ['contact', 'appointment', 'summary'],
      data: {},
      errors: {},
      isSubmitting: false,
      isSubmitted: false,
      isValid: false
    });
  };

  // Calculate additional derived properties
  const steps: FormStep[] = formState.steps.map(stepId => ({
    id: stepId,
    title: stepId.charAt(0).toUpperCase() + stepId.slice(1),
    fields: getFieldsForStep(stepId)
  }));

  const currentStepIndex = formState.currentStep;
  const currentStep = steps[currentStepIndex] || { id: '', title: '', fields: [] };
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === formState.steps.length - 1;

  // Method to go to specific step
  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < formState.steps.length) {
      setFormState(prevState => ({
        ...prevState,
        currentStep: stepIndex,
        errors: {}
      }));
    }
  };

  // Function to get fields for each step
  function getFieldsForStep(stepId: string): string[] {
    switch (stepId) {
      case 'contact':
        return ['name', 'email', 'phone'];
      case 'appointment':
        return ['date', 'time', 'timeSlotId'];
      case 'summary':
        return [];
      default:
        return [];
    }
  }

  // Method to set form errors directly
  const setErrors = (errors: FormErrors) => {
    setFormState(prevState => ({
      ...prevState,
      errors,
      isValid: Object.keys(errors).length === 0
    }));
  };

  // Provide the context value
  const contextValue: FormContextType = {
    formState,
    setFormState,
    updateFormData,
    goToNextStep,
    goToPreviousStep,
    validateStep,
    submitForm,
    resetForm,
    
    // Additional properties
    formData: formState.data,
    errors: formState.errors,
    setErrors,
    currentStepIndex,
    currentStep,
    steps,
    isFirstStep,
    isLastStep,
    goToStep
  };

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
};

// Custom hook for using form context
export const useFormContext = () => useContext(FormContext);

// Add alias for backward compatibility
export const useForm = useFormContext;

export default FormContext; 