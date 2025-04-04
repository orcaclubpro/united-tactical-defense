import React, { useState, useEffect } from 'react';
import ModernModalUI from './ModernModalUI';
import styled from 'styled-components';
import UDTCalendar from '../Calendar/UDTCalendar';
import { submitFreeClassBooking } from '../../services/appointment/appointment-service';

interface FreeLessonFormControllerProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialData?: FormData;
  formSource?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  appointmentDate: Date | null;
  appointmentTime: string;
  experience: string;
  [key: string]: any;
}

// Styled components for enhanced UI
const FormWrapper = styled.div`
  max-width: 100%;
`;

const FormField = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #ddd;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #444;
    border-radius: 4px;
    font-size: 1rem;
    transition: all 0.2s ease;
    background-color: #2c2d30;
    color: #fff;
    
    &:focus {
      outline: none;
      border-color: #f44336;
      box-shadow: 0 0 0 1px rgba(244, 67, 54, 0.2);
    }
    
    &::placeholder {
      color: #777;
    }
  }
  
  .error-message {
    color: #f44336;
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

const StepHeading = styled.h3`
  color: #f44336;
  margin-top: 0;
  margin-bottom: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const StepDescription = styled.p`
  margin-bottom: 24px;
  color: #ccc;
  font-size: 0.95rem;
`;

const FreeClassInfo = styled.div`
  background-color: rgba(244, 67, 54, 0.1);
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  border-left: 4px solid #f44336;
  
  h4 {
    margin-top: 0;
    color: #f44336;
    font-size: 1.1rem;
  }
  
  ul {
    margin-bottom: 0;
    padding-left: 20px;
    color: #ddd;
    
    li {
      margin-bottom: 4px;
    }
  }
`;

const ConfirmationDetails = styled.div`
  background-color: #2c2d30;
  padding: 16px;
  border-radius: 4px;
  margin-top: 16px;
  
  .detail-row {
    display: flex;
    margin-bottom: 12px;
    
    .label {
      width: 120px;
      font-weight: 500;
      flex-shrink: 0;
      color: #999;
    }
    
    .value {
      color: #fff;
    }
  }
`;

// Buttons with tactical styling
const ActionButton = styled.button<{ isPrimary?: boolean }>`
  min-width: 120px;
  padding: 12px 24px;
  background: ${props => props.isPrimary 
    ? 'linear-gradient(to right, #b71c1c, #880e0e)' 
    : 'transparent'};
  border: ${props => props.isPrimary 
    ? 'none' 
    : '1px solid #666'};
  color: ${props => props.isPrimary ? '#fff' : '#ccc'};
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.isPrimary 
      ? 'linear-gradient(to right, #c62828, #9a0f0f)' 
      : 'rgba(255, 255, 255, 0.1)'};
    color: #fff;
  }
  
  &:disabled {
    background: ${props => props.isPrimary ? '#555' : 'transparent'};
    color: #777;
    cursor: not-allowed;
  }
`;

// Step indicator
const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
`;

const StepDot = styled.div<{ active?: boolean; completed?: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 6px;
  background: ${props => {
    if (props.completed) return '#28a745';
    if (props.active) return '#f44336';
    return '#555';
  }};
  transform: ${props => props.active ? 'scale(1.2)' : 'scale(1)'};
  transition: all 0.2s ease;
  
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -10px;
    width: 14px;
    height: 2px;
    background-color: ${props => props.completed ? '#28a745' : '#555'};
    transform: translateY(-50%);
  }
  
  &:last-child::after {
    display: none;
  }
`;

// Progress bar
const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: #444;
  margin-bottom: 24px;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${props => props.percent}%;
  background: linear-gradient(to right, #b71c1c, #f44336);
  transition: width 0.3s ease;
`;

const DarkFormWrapper = styled.div`
  background-color: #1e1f21;
  color: #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 4px;
  margin: 16px 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  border: 1px solid #ef9a9a;

  &::before {
    content: "⚠️";
    margin-right: 8px;
    font-size: 16px;
  }
`;

export const FreeLessonFormController: React.FC<FreeLessonFormControllerProps> = ({
  isOpen: propIsOpen = false,
  onClose,
  initialData = {},
  formSource = 'website'
}) => {
  const [isOpen, setIsOpen] = useState(propIsOpen);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    appointmentDate: initialData.appointmentDate || null,
    appointmentTime: initialData.appointmentTime || '',
    experience: initialData.experience || 'beginner',
    ...initialData
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Sync with prop changes
  useEffect(() => {
    setIsOpen(propIsOpen);
  }, [propIsOpen]);

  // Handle opening the modal
  const handleOpen = () => {
    setIsOpen(true);
  };

  // Handle closing the modal
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
  const validateCurrentStep = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (currentStep === 0) {
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
    } else if (currentStep === 1) {
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

  // Handle next step or form submission
  const handleNext = async () => {
    if (validateCurrentStep()) {
      if (currentStep < 2) { // We have 3 steps (0, 1, 2)
        setCurrentStep(currentStep + 1);
      } else {
        // Submit the form
        handleSubmit();
      }
    }
  };

  // Handle going back a step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Enhanced debugging log
    console.group('🔄 Free Lesson Form Submission');
    console.log('Form data:', {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime,
      experience: formData.experience,
      formSource: formSource,
      timestamp: new Date().toISOString()
    });
    console.groupEnd();
    
    try {
      // Call the appointment service with form data
      const result = await submitFreeClassBooking({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        experience: formData.experience,
        formSource: formSource
      });
      
      // Log detailed response
      if (result.success) {
        console.group('✅ Form Submission Success');
        console.log('Response:', result);
        console.groupEnd();
      } else {
        console.group('❌ Form Submission Error');
        console.error('Error details:', result);
        
        // Log raw response if available
        if (result.data?.rawResponse) {
          console.error('Raw server response:', result.data.rawResponse);
        }
        console.groupEnd();
      }
      
      // Handle response
      if (result.success) {
        setIsSubmitted(true);
      } else {
        setErrors({
          form: result.message || 'There was an error submitting your form. Please try again.'
        });
      }
    } catch (error) {
      console.group('💥 Form Submission Exception');
      console.error('Unexpected error:', error);
      console.groupEnd();
      
      setErrors({
        form: 'An unexpected error occurred. Please try again later.'
      });
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render contact info step
  const renderContactInfoStep = () => (
    <DarkFormWrapper>
      <StepHeading>REGISTER FOR TACTICAL TRAINING</StepHeading>
      <StepDescription>
        Complete your registration details for your free tactical firearms training session.
      </StepDescription>
      
      <FreeClassInfo>
        <h4>TRAINING INFORMATION</h4>
        <ul>
          <li>90-minute live fire simulator session</li>
          <li>Professional instructor-led training</li>
          <li>All equipment and safety gear provided</li>
          <li>No prior experience needed</li>
        </ul>
      </FreeClassInfo>
      
      <FormGrid>
        <FormField>
          <label htmlFor="firstName">FIRST NAME*</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleInputChange}
            placeholder="Your first name"
            required
          />
          {errors.firstName && <div className="error-message">{errors.firstName}</div>}
        </FormField>
        
        <FormField>
          <label htmlFor="lastName">LAST NAME*</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleInputChange}
            placeholder="Your last name"
            required
          />
          {errors.lastName && <div className="error-message">{errors.lastName}</div>}
        </FormField>
      </FormGrid>
      
      <FormField>
        <label htmlFor="email">EMAIL*</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email || ''}
          onChange={handleInputChange}
          placeholder="your.email@example.com"
          required
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </FormField>
      
      <FormField>
        <label htmlFor="phone">PHONE NUMBER*</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleInputChange}
          placeholder="(123) 456-7890"
          required
        />
        {errors.phone && <div className="error-message">{errors.phone}</div>}
      </FormField>
      
      <FormField>
        <label htmlFor="experience">EXPERIENCE LEVEL</label>
        <select
          id="experience"
          name="experience"
          value={formData.experience || 'beginner'}
          onChange={handleInputChange}
        >
          <option value="beginner">Beginner - No Experience</option>
          <option value="novice">Novice - Some Experience</option>
          <option value="intermediate">Intermediate - Regular Experience</option>
          <option value="advanced">Advanced - Extensive Experience</option>
        </select>
      </FormField>
    </DarkFormWrapper>
  );

  // Render appointment step with calendar
  const renderAppointmentStep = () => (
    <DarkFormWrapper>
      <StepHeading>SELECT TRAINING DATE & TIME</StepHeading>
      <StepDescription>
        Choose a date and time for your tactical training session.
      </StepDescription>
      
      <UDTCalendar
        onDateSelected={handleDateSelected}
        onTimeSlotSelected={handleTimeSlotSelected}
      />
      
      {errors.appointmentDate && <div className="error-message">{errors.appointmentDate}</div>}
      {errors.appointmentTime && <div className="error-message">{errors.appointmentTime}</div>}
    </DarkFormWrapper>
  );

  // Render confirmation step
  const renderConfirmationStep = () => (
    <DarkFormWrapper>
      <StepHeading>CONFIRM YOUR BOOKING</StepHeading>
      <StepDescription>
        Please review your training session details before confirming.
      </StepDescription>
      
      <ConfirmationDetails>
        <div className="detail-row">
          <span className="label">Name:</span>
          <span className="value">{formData.firstName} {formData.lastName}</span>
        </div>
        <div className="detail-row">
          <span className="label">Email:</span>
          <span className="value">{formData.email}</span>
        </div>
        <div className="detail-row">
          <span className="label">Phone:</span>
          <span className="value">{formData.phone}</span>
        </div>
        <div className="detail-row">
          <span className="label">Experience:</span>
          <span className="value">{formData.experience}</span>
        </div>
        <div className="detail-row">
          <span className="label">Date:</span>
          <span className="value">{formData.appointmentDate instanceof Date ? formData.appointmentDate.toLocaleDateString() : 'Not selected'}</span>
        </div>
        <div className="detail-row">
          <span className="label">Time:</span>
          <span className="value">{formData.appointmentTime || 'Not selected'}</span>
        </div>
      </ConfirmationDetails>
      
      <FreeClassInfo style={{ marginTop: '20px' }}>
        <h4>IMPORTANT INFORMATION</h4>
        <ul>
          <li>Please arrive 15 minutes before your scheduled time</li>
          <li>Bring a valid ID</li>
          <li>Wear closed-toe shoes and comfortable clothing</li>
          <li>You may bring one guest at no additional charge</li>
        </ul>
      </FreeClassInfo>
      
      {errors.form && <ErrorMessage>{errors.form}</ErrorMessage>}
    </DarkFormWrapper>
  );

  // Render success message
  const renderSuccessMessage = () => (
    <DarkFormWrapper>
      <div className="success-message" style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: '48px', color: '#4CAF50', marginBottom: '16px' }}>✓</div>
        <StepHeading>BOOKING CONFIRMED</StepHeading>
        <p>Your tactical training session has been successfully booked.</p>
        <p>A confirmation email has been sent to <strong>{formData.email}</strong>.</p>
        
        <ConfirmationDetails style={{ maxWidth: '400px', margin: '20px auto' }}>
          <div className="detail-row">
            <span className="label">Date:</span>
            <span className="value">{formData.appointmentDate instanceof Date ? formData.appointmentDate.toLocaleDateString() : 'Not specified'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Time:</span>
            <span className="value">{formData.appointmentTime || 'Not specified'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Location:</span>
            <span className="value">Anaheim Hills Training Center</span>
          </div>
        </ConfirmationDetails>
        
        <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#f44336' }}>
          PLEASE ARRIVE 15 MINUTES EARLY
        </p>
      </div>
    </DarkFormWrapper>
  );

  // Get content based on current step
  const getStepContent = () => {
    if (isSubmitted) {
      return renderSuccessMessage();
    }
    
    switch(currentStep) {
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

  // Determine button text based on current step
  const getButtonText = () => {
    if (isSubmitting) return 'PROCESSING...';
    
    switch (currentStep) {
      case 0:
        return 'CONTINUE';
      case 1:
        return 'CONTINUE';
      case 2:
        return 'CONFIRM BOOKING';
      default:
        return 'NEXT';
    }
  };

  // The progress for the progress bar
  const getProgress = () => {
    return ((currentStep + 1) / 3) * 100;
  };

  // Footer buttons
  const renderFooterContent = () => {
    if (isSubmitted) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ActionButton
            isPrimary
            onClick={handleClose}
          >
            CLOSE
          </ActionButton>
        </div>
      );
    }
    
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <ActionButton
          onClick={currentStep === 0 ? handleClose : handlePrevious}
        >
          {currentStep === 0 ? 'CANCEL' : 'BACK'}
        </ActionButton>
        <ActionButton
          isPrimary
          onClick={handleNext}
          disabled={isSubmitting}
        >
          {getButtonText()}
        </ActionButton>
      </div>
    );
  };

  return (
    <>
      {/* Trigger button when modal is closed */}
      {!isOpen && (
        <button
          className="btn btn-primary booking-trigger"
          onClick={handleOpen}
          style={{
            background: 'linear-gradient(to right, #b71c1c, #880e0e)',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '4px',
            color: 'white',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          BOOK FREE TRAINING
        </button>
      )}

      {/* Modal with form content */}
      {isOpen && (
        <ModernModalUI
          isOpen={isOpen}
          onClose={handleClose}
          title="TACTICAL TRAINING REGISTRATION"
          footerContent={renderFooterContent()}
          showHook={!isSubmitted}
          hookMessage="LIMITED SLOTS AVAILABLE THIS WEEK!"
          darkMode={true}
        >
          <div>
            {/* Progress bar */}
            {!isSubmitted && (
              <ProgressBar>
                <ProgressFill percent={getProgress()} />
              </ProgressBar>
            )}
            
            {/* Step indicators */}
            {!isSubmitted && (
              <StepIndicator>
                {[0, 1, 2].map(step => (
                  <StepDot 
                    key={step}
                    active={currentStep === step}
                    completed={currentStep > step}
                  />
                ))}
              </StepIndicator>
            )}
            
            {getStepContent()}
          </div>
        </ModernModalUI>
      )}
    </>
  );
}; 