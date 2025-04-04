import React, { useState, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import ModernModalUI from './ModernModalUI';
import * as api from '../../services/api';

interface FreeLessonFormControllerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const FreeLessonFormController: React.FC<FreeLessonFormControllerProps> = ({
  isOpen: propIsOpen = false,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(propIsOpen);
  const { formState, validateStep, goToNextStep, submitForm } = useFormContext();
  
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

  // Handle form step navigation
  const handleNext = async () => {
    const currentStepName = formState.steps[formState.currentStep];
    
    // Validate current step
    const isValid = validateStep(currentStepName);
    
    if (isValid) {
      // If we're on the last step, submit the form
      if (formState.currentStep === formState.steps.length - 1) {
        await submitForm();
      } else {
        // Otherwise, go to next step
        goToNextStep();
      }
    }
  };

  // Render appropriate content based on current step
  const renderStepContent = () => {
    const { currentStep, steps } = formState;
    const currentStepName = steps[currentStep];

    switch (currentStepName) {
      case 'contact':
        return (
          <div data-testid="contact-form-step">
            <h3>Contact Information</h3>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                placeholder="Your full name"
                defaultValue={formState.data.name || ''}
                onChange={(e) => {
                  const formData = { name: e.target.value };
                  // Update the form data using the context
                  // This would normally be done with updateFormData function from context
                }}
              />
              {formState.errors.name && (
                <div className="error-message">{formState.errors.name}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="Your email address"
                defaultValue={formState.data.email || ''}
                onChange={(e) => {
                  // Update email in form data
                }}
              />
              {formState.errors.email && (
                <div className="error-message">{formState.errors.email}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-control"
                placeholder="Your phone number"
                defaultValue={formState.data.phone || ''}
                onChange={(e) => {
                  // Update phone in form data
                }}
              />
              {formState.errors.phone && (
                <div className="error-message">{formState.errors.phone}</div>
              )}
            </div>
          </div>
        );
      
      case 'appointment':
        return (
          <div data-testid="booking-calendar">
            <h3>Select Date and Time</h3>
            <p>Please select a date and time for your free lesson</p>
            {/* Calendar component would be rendered here */}
            {formState.errors.appointmentDate && (
              <div className="error-message">{formState.errors.appointmentDate}</div>
            )}
            {formState.errors.appointmentTime && (
              <div className="error-message">{formState.errors.appointmentTime}</div>
            )}
          </div>
        );
      
      case 'summary':
        return (
          <div data-testid="booking-summary">
            <h3>Booking Summary</h3>
            <p>Please confirm your booking details:</p>
            <div className="summary-details">
              <div className="detail-row">
                <span className="label">Name:</span>
                <span className="value">{formState.data.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span className="value">{formState.data.email}</span>
              </div>
              <div className="detail-row">
                <span className="label">Phone:</span>
                <span className="value">{formState.data.phone}</span>
              </div>
              <div className="detail-row">
                <span className="label">Date:</span>
                <span className="value">{formState.data.appointmentDate}</span>
              </div>
              <div className="detail-row">
                <span className="label">Time:</span>
                <span className="value">{formState.data.appointmentTime}</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Unknown step</div>;
    }
  };

  // Render the success message after form submission
  const renderSuccessMessage = () => {
    return (
      <div data-testid="booking-success" className="success-message">
        <h3>Booking Confirmed!</h3>
        <p>Your free training session has been successfully booked.</p>
        <p>We've sent a confirmation email to {formState.data.email} with all the details.</p>
        <p>
          <strong>Date:</strong> {formState.data.appointmentDate}<br />
          <strong>Time:</strong> {formState.data.appointmentTime}
        </p>
        <p>Please arrive 15 minutes early for your session. We're looking forward to meeting you!</p>
        <button 
          className="btn btn-primary" 
          onClick={handleClose}
        >
          Close
        </button>
      </div>
    );
  };

  // Determine button text based on current step
  const getButtonText = () => {
    const { currentStep, steps } = formState;
    if (currentStep === steps.length - 1) {
      return 'Confirm Booking';
    }
    return 'Next';
  };

  return (
    <>
      {/* Trigger button when modal is closed */}
      {!isOpen && (
        <button
          className="btn btn-primary booking-trigger"
          onClick={handleOpen}
        >
          Book Your Free Class
        </button>
      )}

      {/* Modal with form content */}
      {isOpen && (
        <ModernModalUI
          isOpen={isOpen}
          onClose={handleClose}
          title="Book Your Free Training Session"
          footerContent={
            !formState.isSubmitted ? (
              <div className="modal-footer-buttons">
                <button
                  className="btn btn-secondary"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={formState.isSubmitting}
                >
                  {formState.isSubmitting ? 'Processing...' : getButtonText()}
                </button>
              </div>
            ) : null
          }
        >
          <div data-testid="modal-form" className="form-container">
            {!formState.isSubmitted ? renderStepContent() : renderSuccessMessage()}
          </div>
        </ModernModalUI>
      )}
    </>
  );
}; 