import { useCallback, useEffect, useState } from 'react';
import { useForm, FormStep, FormData } from '../contexts/FormContext';
import useFormValidation from './useFormValidation';
import { FormValidator } from '../services/validation/formValidator';

interface UseFormStepProps {
  validator: FormValidator;
  onStepChange?: (direction: 'next' | 'prev', stepIndex: number) => void;
  validateOnStepChange?: boolean;
}

interface UseFormStepReturn {
  currentStep: FormStep;
  currentStepIndex: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToNextStep: () => boolean;
  goToPreviousStep: () => boolean;
  goToStep: (stepIndex: number) => boolean;
  stepProgress: number;
  isStepComplete: (stepIndex: number) => boolean;
  isStepValid: (stepIndex: number) => boolean;
  isFormComplete: boolean;
  completeForm: () => Promise<boolean>;
}

const useFormStep = ({
  validator,
  onStepChange,
  validateOnStepChange = true
}: UseFormStepProps): UseFormStepReturn => {
  const {
    steps,
    currentStepIndex,
    currentStep,
    isFirstStep,
    isLastStep,
    goToStep: contextGoToStep,
    goToNextStep: contextGoToNextStep,
    goToPreviousStep: contextGoToPreviousStep,
    formData,
    submitForm
  } = useForm();
  
  const { validateStep, validateForm } = useFormValidation({ validator });
  
  // Track which steps have been completed
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [isFormComplete, setIsFormComplete] = useState<boolean>(false);
  
  // Calculate progress percentage
  const stepProgress = ((currentStepIndex + 1) / steps.length) * 100;
  
  // Check if a specific step is complete
  const isStepComplete = useCallback((stepIndex: number): boolean => {
    return completedSteps[stepIndex] || false;
  }, [completedSteps]);
  
  // Check if a specific step is valid
  const isStepValid = useCallback((stepIndex: number): boolean => {
    const step = steps[stepIndex];
    if (!step) return true;
    
    // Get all required fields for this step
    const requiredFields = step.optional 
      ? [] 
      : step.fields;
    
    // Check if all required fields have values
    const hasAllRequiredFields = requiredFields.every(field => {
      const value = formData[field];
      return value !== undefined && value !== null && value !== '';
    });
    
    return hasAllRequiredFields;
  }, [formData, steps]);
  
  // Mark current step as completed
  const markCurrentStepComplete = useCallback(() => {
    setCompletedSteps(prev => ({
      ...prev,
      [currentStepIndex]: true
    }));
  }, [currentStepIndex]);
  
  // Go to next step with validation
  const goToNextStep = useCallback((): boolean => {
    if (isLastStep) return false;
    
    if (validateOnStepChange) {
      const isValid = validateStep();
      if (!isValid) return false;
    }
    
    markCurrentStepComplete();
    
    // Call the context method to change step
    contextGoToNextStep();
    
    // Since we've validated and marked the step as complete, 
    // we can safely assume this was successful
    const newStepIndex = currentStepIndex + 1;
    
    if (onStepChange) {
      onStepChange('next', newStepIndex);
    }
    
    return true;
  }, [
    isLastStep,
    validateOnStepChange,
    validateStep,
    markCurrentStepComplete,
    contextGoToNextStep,
    onStepChange,
    currentStepIndex
  ]);
  
  // Go to previous step
  const goToPreviousStep = useCallback((): boolean => {
    if (isFirstStep) return false;
    
    // Call the context method to change step
    contextGoToPreviousStep();
    
    // Since we've checked if it's the first step, 
    // we can safely assume this was successful
    const newStepIndex = currentStepIndex - 1;
    
    if (onStepChange) {
      onStepChange('prev', newStepIndex);
    }
    
    return true;
  }, [isFirstStep, contextGoToPreviousStep, onStepChange, currentStepIndex]);
  
  // Go to a specific step
  const goToStep = useCallback((stepIndex: number): boolean => {
    if (stepIndex < 0 || stepIndex >= steps.length) {
      return false;
    }
    
    // Can only go forward if all previous steps are complete
    if (stepIndex > currentStepIndex) {
      for (let i = 0; i < stepIndex; i++) {
        if (!isStepComplete(i) && !steps[i]?.optional) {
          return false;
        }
      }
    }
    
    contextGoToStep(stepIndex);
    
    if (onStepChange) {
      onStepChange(
        stepIndex > currentStepIndex ? 'next' : 'prev',
        stepIndex
      );
    }
    
    return true;
  }, [steps.length, currentStepIndex, isStepComplete, steps, contextGoToStep, onStepChange]);
  
  // Complete form and submit
  const completeForm = useCallback(async (): Promise<boolean> => {
    const isValid = validateForm();
    
    if (!isValid) {
      // Find first invalid step and go to it
      for (let i = 0; i < steps.length; i++) {
        if (!isStepValid(i)) {
          goToStep(i);
          return false;
        }
      }
      return false;
    }
    
    try {
      const success = await submitForm();
      
      if (success) {
        setIsFormComplete(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error submitting form:', error);
      return false;
    }
  }, [validateForm, steps, isStepValid, goToStep, submitForm]);
  
  // Reset form completion status when form data changes
  useEffect(() => {
    setIsFormComplete(false);
  }, [formData]);
  
  return {
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    stepProgress,
    isStepComplete,
    isStepValid,
    isFormComplete,
    completeForm
  };
};

export default useFormStep; 