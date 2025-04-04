import React, { ReactElement, useState, useCallback, useEffect, isValidElement } from 'react';
import { FormProvider, FormData, FormStep as FormStepType } from '../../contexts/FormContext';
import FormStep from './FormStep';
import FormSubmissionStatus from './FormSubmissionStatus';
import { submitForm, FormSubmissionProgress, isOnline, setupConnectionListeners } from '../../services/api';
import ConnectionStatus from './ConnectionStatus';
import styled, { DefaultTheme } from 'styled-components';

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (formData: FormData) => Promise<boolean>;
  steps: FormStepType[];
  initialData?: FormData;
  title: string;
  children: ReactElement | ReactElement[];
  formType?: 'free-class' | 'assessment' | 'contact' | string;
}

// Define theme interface extension
interface ThemeWithOffline extends DefaultTheme {
  offline?: boolean;
}

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  &.open {
    opacity: 1;
    visibility: visible;
  }
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
  transform: translateY(20px);
  transition: transform 0.3s ease;
  
  .open & {
    transform: translateY(0);
  }
`;

const ModalHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  button {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    padding: 0;
    color: #666;
    
    &:hover {
      color: #333;
    }
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ConnectionStatusWrapper = styled.div<{ theme: ThemeWithOffline }>`
  margin-bottom: 12px;
  position: sticky;
  top: 0;
  z-index: 5;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 8px 0;
  border-radius: 4px;
  box-shadow: ${props => props.theme.offline ? '0 2px 8px rgba(255, 87, 34, 0.15)' : 'none'};
  transition: box-shadow 0.3s ease, background-color 0.3s ease;
  
  &.offline {
    background-color: rgba(255, 244, 230, 0.95);
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: #eaeaea;
  margin-bottom: 24px;
  border-radius: 2px;
  overflow: hidden;
  
  .progress {
    height: 100%;
    background-color: #007bff;
    transition: width 0.3s ease;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  
  .step-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #eaeaea;
    margin: 0 4px;
    transition: background-color 0.3s ease;
    
    &.active {
      background-color: #007bff;
    }
    
    &.completed {
      background-color: #28a745;
    }
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &.primary {
    background-color: #007bff;
    color: white;
    border: none;
    
    &:hover {
      background-color: #0069d9;
    }
    
    &:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background-color: transparent;
    color: #6c757d;
    border: 1px solid #6c757d;
    
    &:hover {
      background-color: #f8f9fa;
    }
    
    &:disabled {
      color: #cccccc;
      border-color: #cccccc;
      cursor: not-allowed;
    }
  }
`;

/**
 * ModalForm component is a container for multi-step forms displayed in a modal.
 * It manages form state, step navigation, and form submission.
 */
const ModalForm: React.FC<ModalFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  steps, 
  initialData = {},
  title,
  children,
  formType = 'free-class' // Default form type
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<FormSubmissionProgress>({
    status: 'idle',
    progress: 0,
    currentAttempt: 0,
    maxAttempts: 0
  });
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [queuedForms, setQueuedForms] = useState(0);
  
  // Reset to first step when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveStepIndex(0);
      setCompletedSteps([]);
      setIsSubmitting(false);
      setSubmissionStatus({
        status: 'idle',
        progress: 0,
        currentAttempt: 0,
        maxAttempts: 0
      });
    }
  }, [isOpen]);
  
  // Setup connection listeners
  useEffect(() => {
    setupConnectionListeners(
      // Online callback
      () => {
        setIsOffline(false);
      },
      // Offline callback
      () => {
        setIsOffline(true);
      }
    );
    
    // Initial check
    setIsOffline(!isOnline());
  }, []);
  
  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    try {
      let success = false;
      
      // Update submission status based on progress
      const handleSubmissionProgress = (progress: FormSubmissionProgress) => {
        setSubmissionStatus(progress);
      };
      
      // If custom onSubmit is provided, use it
      if (onSubmit) {
        success = await onSubmit(formData);
      } else {
        // Otherwise use the default submitForm function with offline support
        const result = await submitForm(
          formType, 
          formData, 
          { 
            retryCount: 3,
            retryDelay: 2000,
            trackProgress: true
          },
          handleSubmissionProgress
        );
        
        success = result.success;
        
        // If submission was queued for later (offline)
        if (!success && result.data?.queued) {
          handleSubmissionProgress({
            status: 'submitting',
            progress: 100,
            currentAttempt: 1,
            maxAttempts: 1,
            error: 'Your form has been saved and will be submitted when you are back online.'
          });
          return;
        }
      }
      
      if (success) {
        // Handle successful submission
        setSubmissionStatus({
          status: 'success',
          progress: 100,
          currentAttempt: 1,
          maxAttempts: 1
        });
      }
    } catch (error) {
      // Handle submission errors
      setSubmissionStatus({
        status: 'error',
        progress: 100,
        currentAttempt: 1,
        maxAttempts: 1,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Add this function for retrying submission
  const handleRetrySubmit = () => {
    if (activeStepIndex === steps.length - 1) {
      handleSubmit(initialData);
    }
  };
  
  // Mark step as completed
  const handleStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };
  
  // Navigate to next step
  const handleNextStep = () => {
    if (activeStepIndex < steps.length - 1) {
      if (completedSteps.includes(activeStepIndex)) {
        setActiveStepIndex(activeStepIndex + 1);
      }
    } else if (completedSteps.includes(activeStepIndex)) {
      // Last step, trigger submit
      handleSubmit(initialData);
    }
  };
  
  // Navigate to previous step
  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = ((activeStepIndex + 1) / steps.length) * 100;
  
  // Check if current step is valid (to be implemented with form context)
  const isStepValid = true;
  
  // Check if we're on the last step
  const isLastStep = activeStepIndex === steps.length - 1;
  
  // Render the form steps
  const renderChildren = () => {
    // If children is an array, render only the active step
    if (Array.isArray(children)) {
      // Only render the child at the activeStepIndex
      // Each child is expected to be a FormStep component
      return React.Children.map(children, (child, index) => {
        // Only render the active step
        if (index === activeStepIndex && isValidElement(child)) {
          return child;
        }
        return null;
      });
    }
    
    // If single child, render it if we're on the first step
    if (isValidElement(children) && activeStepIndex === 0) {
      return children;
    }
    
    return null;
  };
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    // ... existing implementation
  };
  
  if (!isOpen) {
    return null;
  }
  
  // Render modal content based on the current state
  return (
    <div className="modal-wrapper">
      <ModalBackdrop className={isOpen ? 'open' : ''} onClick={handleBackdropClick}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <h2>{title}</h2>
            <button onClick={onClose}>&times;</button>
          </ModalHeader>
          
          <ModalBody>
            <ConnectionStatusWrapper className={isOffline ? 'offline' : ''} theme={{ offline: isOffline }}>
              <ConnectionStatus 
                variant={isOffline ? 'full' : 'minimal'} 
                showQueuedCount={true}
                className={isOffline ? 'highlighted' : ''}
              />
            </ConnectionStatusWrapper>
            
            {submissionStatus.status !== 'idle' ? (
              <FormSubmissionStatus
                status={submissionStatus.status}
                progress={submissionStatus.progress}
                currentAttempt={submissionStatus.currentAttempt}
                maxAttempts={submissionStatus.maxAttempts}
                onRetry={handleRetrySubmit}
                isOffline={isOffline}
              />
            ) : (
              <>
                <ProgressBar>
                  <div 
                    className="progress" 
                    style={{ width: `${((activeStepIndex + 1) / steps.length) * 100}%` }}
                  />
                </ProgressBar>
                
                <StepIndicator>
                  {steps.map((_, index) => (
                    <div 
                      key={index}
                      className={`step-dot ${
                        index === activeStepIndex ? 'active' : 
                        completedSteps.includes(index) ? 'completed' : ''
                      }`}
                    />
                  ))}
                </StepIndicator>
                
                {renderChildren()}
              </>
            )}
          </ModalBody>
          
          {submissionStatus.status === 'idle' && (
            <ModalFooter>
              <Button 
                className="secondary" 
                onClick={handlePrevStep}
                disabled={activeStepIndex === 0}
              >
                Back
              </Button>
              
              <Button 
                className="primary" 
                onClick={handleNextStep}
                disabled={!completedSteps.includes(activeStepIndex)}
              >
                {activeStepIndex === steps.length - 1 ? 'Submit' : 'Next'}
                {isOffline && activeStepIndex === steps.length - 1 && ' (Will be queued)'}
              </Button>
            </ModalFooter>
          )}
        </ModalContainer>
      </ModalBackdrop>
    </div>
  );
};

export default ModalForm; 