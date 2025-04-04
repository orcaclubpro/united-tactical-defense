import React, { ReactElement, useState, useEffect, isValidElement } from 'react';
import { FormProvider, FormData, FormStep as FormStepType } from '../../contexts/FormContext';
import FormStep from './FormStep';
import FormSubmissionStatus from './FormSubmissionStatus';
import { submitForm, FormSubmissionProgress, isOnline, setupConnectionListeners } from '../../services/api';
import ConnectionStatus from './ConnectionStatus';
import styled, { DefaultTheme, keyframes } from 'styled-components';
import BookingCalendar from '../Calendar/BookingCalendar';

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (formData: FormData) => Promise<{ success: boolean, data?: any, error?: any }>;
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

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  backdrop-filter: blur(3px);
  
  &.open {
    opacity: 1;
    visibility: visible;
  }
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  width: 95%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
  transform: translateY(20px);
  transition: transform 0.3s ease;
  animation: ${slideIn} 0.4s ease-out forwards;
  
  .open & {
    transform: translateY(0);
  }
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 12px 12px 0 0;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
  }
  
  button {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    border-radius: 50%;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: rgba(0,0,0,0.1);
      color: #333;
    }
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ConnectionStatusWrapper = styled.div<{ theme: ThemeWithOffline }>`
  margin-bottom: 16px;
  position: sticky;
  top: 0;
  z-index: 5;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 8px 0;
  border-radius: 8px;
  box-shadow: ${props => props.theme.offline ? '0 2px 8px rgba(255, 87, 34, 0.15)' : 'none'};
  transition: box-shadow 0.3s ease, background-color 0.3s ease;
  
  &.offline {
    background-color: rgba(255, 244, 230, 0.95);
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #eaeaea;
  margin-bottom: 24px;
  border-radius: 3px;
  overflow: hidden;
  
  .progress {
    height: 100%;
    background: linear-gradient(90deg, #4a6eb5 0%, #2b5cd9 100%);
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
    margin: 0 6px;
    position: relative;
    transition: background-color 0.3s ease;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: -10px;
      width: 16px;
      height: 2px;
      background-color: #eaeaea;
      transform: translateY(-50%);
    }
    
    &:first-child::after {
      display: none;
    }
    
    &.active {
      background-color: #2b5cd9;
      transform: scale(1.2);
    }
    
    &.completed {
      background-color: #28a745;
    }
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  
  &.primary {
    background-color: #1890ff;
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      background-color: #40a9ff;
    }
    
    &:disabled {
      background-color: #bae7ff;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background-color: white;
    color: rgba(0, 0, 0, 0.65);
    border: 1px solid #d9d9d9;
    
    &:hover {
      border-color: #40a9ff;
      color: #40a9ff;
    }
  }
`;

const FormField = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
  }
  
  input, select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: border 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: #2b5cd9;
      box-shadow: 0 0 0 2px rgba(43, 92, 217, 0.1);
    }
  }
  
  .error-text {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 4px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FreeClassInfo = styled.div`
  background-color: #f0f4ff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #2b5cd9;
  
  h3 {
    margin-top: 0;
    color: #2b5cd9;
  }
  
  ul {
    margin-bottom: 0;
    padding-left: 20px;
  }
`;

/**
 * Modern ModalForm component for booking free classes and other form types.
 * Features an integrated calendar for time slot selection.
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
  const [submissionStatus, setSubmissionStatus] = useState<FormSubmissionProgress | null>(null);
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [queuedForms, setQueuedForms] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverResponse, setServerResponse] = useState<any>(null);
  
  // Reset to first step when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveStepIndex(0);
      setCompletedSteps([]);
      setIsSubmitting(false);
      setSubmissionStatus(null);
      setFormData(initialData);
      setErrors({});
    }
  }, [isOpen, initialData]);
  
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
  
  // Handle form data changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle calendar date selection
  const handleDateSelected = (date: Date) => {
    setFormData({
      ...formData,
      appointmentDate: date
    });
    
    // Clear date error
    if (errors.appointmentDate) {
      setErrors({
        ...errors,
        appointmentDate: ''
      });
    }
  };
  
  // Handle time slot selection
  const handleTimeSlotSelected = (timeSlot: any) => {
    setFormData({
      ...formData,
      appointmentTime: timeSlot.time,
      timeSlotId: timeSlot.id
    });
    
    // Clear time error
    if (errors.appointmentTime) {
      setErrors({
        ...errors,
        appointmentTime: ''
      });
    }
  };
  
  // Validate the current step
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (activeStepIndex === 0) {
      // Contact info validation
      if (!formData.firstName?.trim()) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!formData.lastName?.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      
      if (!formData.email?.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      
      if (!formData.phone?.trim()) {
        newErrors.phone = 'Phone number is required';
      }
    } else if (activeStepIndex === 1) {
      // Appointment validation
      if (!formData.appointmentDate) {
        newErrors.appointmentDate = 'Please select a date';
      }
      
      if (!formData.appointmentTime) {
        newErrors.appointmentTime = 'Please select a time slot';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    try {
      let success = false;
      let responseData = null;
      
      // Update submission status based on progress
      const handleSubmissionProgress = (progress: FormSubmissionProgress) => {
        setSubmissionStatus(progress);
      };
      
      // Prepare final submission data
      const finalFormData = {
        ...formData,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        selected_slot: formData.appointmentDate ? 
          `${formData.appointmentDate.toISOString().split('T')[0]}T${formData.appointmentTime}:00` : 
          null,
        selected_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      
      // If custom onSubmit is provided, use it
      if (onSubmit) {
        const result = await onSubmit(finalFormData);
        success = result.success;
        responseData = result.data;
        setServerResponse(result);
      } else {
        // Otherwise use the default submitForm function with offline support
        const result = await submitForm(
          formType, 
          finalFormData, 
          { 
            retryCount: 3,
            retryDelay: 2000,
            trackProgress: true
          },
          handleSubmissionProgress
        );
        
        success = result.success;
        responseData = result.data;
        setServerResponse(result);
        
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
      handleSubmit(formData);
    }
  };
  
  // Navigate to next step
  const handleNextStep = () => {
    if (validateStep()) {
      if (activeStepIndex < steps.length - 1) {
        setActiveStepIndex(activeStepIndex + 1);
        if (!completedSteps.includes(activeStepIndex)) {
          setCompletedSteps([...completedSteps, activeStepIndex]);
        }
      } else {
        // Last step, trigger submit
        handleSubmit(formData);
        if (!completedSteps.includes(activeStepIndex)) {
          setCompletedSteps([...completedSteps, activeStepIndex]);
        }
      }
    }
  };
  
  // Navigate to previous step
  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
    }
  };
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Close only if clicking directly on the backdrop
    if ((e.target as HTMLElement).classList.contains('backdrop')) {
      onClose();
    }
  };
  
  if (!isOpen) {
    return null;
  }
  
  // Render contact info step
  const renderContactInfoStep = () => (
    <div className="contact-info-step">
      <FreeClassInfo>
        <h3>Book Your Free Training Class</h3>
        <p>Experience our training firsthand with a free introductory class. Please fill out your contact details below to get started.</p>
        <ul>
          <li>No prior experience required</li>
          <li>Professional instructors</li>
          <li>All equipment provided</li>
        </ul>
      </FreeClassInfo>
      
      <FormGrid>
        <FormField>
          <label htmlFor="firstName">First Name*</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleInputChange}
            placeholder="Your first name"
          />
          {errors.firstName && <div className="error-text">{errors.firstName}</div>}
        </FormField>
        
        <FormField>
          <label htmlFor="lastName">Last Name*</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleInputChange}
            placeholder="Your last name"
          />
          {errors.lastName && <div className="error-text">{errors.lastName}</div>}
        </FormField>
      </FormGrid>
      
      <FormField>
        <label htmlFor="email">Email*</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email || ''}
          onChange={handleInputChange}
          placeholder="your.email@example.com"
        />
        {errors.email && <div className="error-text">{errors.email}</div>}
      </FormField>
      
      <FormField>
        <label htmlFor="phone">Phone Number*</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleInputChange}
          placeholder="(123) 456-7890"
        />
        {errors.phone && <div className="error-text">{errors.phone}</div>}
      </FormField>
    </div>
  );
  
  // Render appointment step
  const renderAppointmentStep = () => (
    <div className="appointment-step">
      <h3>Select Date & Time</h3>
      <p>Choose a date and time that works best for your free training session.</p>
      
      <BookingCalendar
        onDateSelected={handleDateSelected}
        onTimeSlotSelected={handleTimeSlotSelected}
        programType={formType}
      />
      
      {errors.appointmentDate && <div className="error-text">{errors.appointmentDate}</div>}
      {errors.appointmentTime && <div className="error-text">{errors.appointmentTime}</div>}
    </div>
  );
  
  // Render confirmation step
  const renderConfirmationStep = () => (
    <div className="confirmation-step">
      {submissionStatus && (
        <FormSubmissionStatus 
          status={submissionStatus.status}
          progress={submissionStatus.progress}
          error={submissionStatus.error}
          currentAttempt={submissionStatus.currentAttempt}
          maxAttempts={submissionStatus.maxAttempts}
          onRetry={handleRetrySubmit}
          onClose={onClose}
          isOffline={!navigator.onLine}
          serverResponse={serverResponse}
          showServerResponse={true}
        />
      )}
    </div>
  );
  
  // Get content based on current step
  const getStepContent = () => {
    switch(activeStepIndex) {
      case 0:
        return renderContactInfoStep();
      case 1:
        return renderAppointmentStep();
      case 2:
        return renderConfirmationStep();
      default:
        return null;
    }
  };
  
  // Render modal content based on the current state
  return (
    <div className="modal-wrapper">
      <ModalBackdrop className={`backdrop ${isOpen ? 'open' : ''}`} onClick={handleBackdropClick}>
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
            
            {submissionStatus === null ? (
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
                
                {getStepContent()}
              </>
            ) : (
              <>
                {submissionStatus.status !== 'idle' && (
                  <FormSubmissionStatus
                    status={submissionStatus.status}
                    progress={submissionStatus.progress}
                    currentAttempt={submissionStatus.currentAttempt}
                    maxAttempts={submissionStatus.maxAttempts}
                    onRetry={handleRetrySubmit}
                    isOffline={isOffline}
                    serverResponse={serverResponse}
                    showServerResponse={true}
                  />
                )}
              </>
            )}
          </ModalBody>
          
          {submissionStatus === null && (
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
              >
                {activeStepIndex === steps.length - 1 ? 'Book My Free Class' : 'Next'}
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