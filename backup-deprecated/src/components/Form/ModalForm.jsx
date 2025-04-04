import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FormProvider, useForm } from '../../contexts/FormContext';
import useFormStep from '../../hooks/useFormStep';
import './ModalForm.css';

/**
 * StepIndicator Component
 * Displays progress through multi-step form
 */
const StepIndicator = ({ currentStep, totalSteps, onStepClick }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i);
  
  return (
    <div className="step-indicator" data-testid="step-indicator">
      {steps.map((step) => (
        <div 
          key={step}
          className={`step-dot ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
          onClick={() => onStepClick(step)}
          role="button"
          tabIndex={0}
          aria-label={`Go to step ${step + 1}`}
          data-testid={`step-dot-${step}`}
        />
      ))}
      <div 
        className="progress-bar"
        style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        data-testid="progress-bar"
      />
    </div>
  );
};

StepIndicator.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  onStepClick: PropTypes.func.isRequired,
};

/**
 * FormNavigation Component
 * Provides next/previous navigation controls
 */
const FormNavigation = ({ 
  onNext, 
  onPrev, 
  isFirstStep, 
  isLastStep,
  isNextEnabled,
  submitLabel,
  nextLabel,
  prevLabel,
  onSubmit
}) => {
  return (
    <div className="form-navigation" data-testid="form-navigation">
      {!isFirstStep && (
        <button
          type="button"
          className="prev-button"
          onClick={onPrev}
          data-testid="prev-button"
        >
          {prevLabel}
        </button>
      )}
      
      <button
        type="button"
        className={`next-button ${!isNextEnabled ? 'disabled' : ''}`}
        onClick={isLastStep ? onSubmit : onNext}
        disabled={!isNextEnabled}
        data-testid={isLastStep ? 'submit-button' : 'next-button'}
      >
        {isLastStep ? submitLabel : nextLabel}
      </button>
    </div>
  );
};

FormNavigation.propTypes = {
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  isFirstStep: PropTypes.bool.isRequired,
  isLastStep: PropTypes.bool.isRequired,
  isNextEnabled: PropTypes.bool.isRequired,
  submitLabel: PropTypes.string,
  nextLabel: PropTypes.string,
  prevLabel: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
};

FormNavigation.defaultProps = {
  submitLabel: 'Submit',
  nextLabel: 'Next',
  prevLabel: 'Back',
};

/**
 * ModalForm Container Component
 * 
 * Top-level container for multi-step forms.
 * Manages the form state, step navigation, and submission.
 */
const ModalForm = ({
  children,
  initialData,
  onSubmit,
  title,
  isOpen,
  onClose,
  validateBeforeNext,
  submitLabel,
  nextLabel,
  prevLabel,
}) => {
  // Modal ref for click outside handling
  const modalRef = useRef(null);
  // Track if form has been initialized
  const [isInitialized, setIsInitialized] = useState(false);

  // Wrap component body in FormProvider
  const FormContent = () => {
    // Access form context
    const form = useForm();
    
    // Initialize form with initial data once
    useEffect(() => {
      if (!isInitialized && initialData) {
        form.updateField(initialData);
        setIsInitialized(true);
      }
      
      // Count child steps and set total steps
      const childCount = React.Children.count(children);
      form.setTotalSteps(childCount);
    }, [form, initialData]);
    
    // Get step navigation helpers
    const {
      currentStep,
      totalSteps,
      isFirstStep,
      isLastStep,
      isCurrentStepValid,
      nextStep,
      prevStep,
      goToStep,
    } = useFormStep({
      validateBeforeNext,
      onComplete: (formData) => {
        // Optional: handle step completion
      },
    });
    
    // Handle form submission
    const handleSubmit = async () => {
      if (!isCurrentStepValid) return;
      
      try {
        form.submitForm();
        await onSubmit(form.formData);
        form.submitFormSuccess();
      } catch (error) {
        form.submitFormError(error.message || 'Submission failed');
      }
    };
    
    // Handle modal close with confirmation if form has data
    const handleClose = () => {
      const hasData = Object.keys(form.formData).length > 0;
      
      if (!hasData || window.confirm('Are you sure you want to close the form? Your data will be lost.')) {
        form.resetForm();
        onClose();
      }
    };

    // Handle clicks outside the modal content
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleClose();
      }
    };
    
    // If modal is not open, don't render
    if (!isOpen) return null;
    
    return (
      <div 
        className="modal-overlay" 
        onClick={handleOutsideClick}
        data-testid="modal-overlay"
      >
        <div 
          className="modal-container" 
          ref={modalRef}
          data-testid="modal-container"
        >
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button 
              type="button" 
              className="close-button" 
              onClick={handleClose}
              aria-label="Close"
              data-testid="close-button"
            >
              &times;
            </button>
          </div>
          
          {totalSteps > 1 && (
            <StepIndicator 
              currentStep={currentStep}
              totalSteps={totalSteps}
              onStepClick={goToStep}
            />
          )}
          
          <div className="modal-body">
            <div className="form-content">
              {children}
            </div>
            
            {form.submissionError && (
              <div className="error-message" data-testid="submission-error">
                {form.submissionError}
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <FormNavigation
              onNext={nextStep}
              onPrev={prevStep}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              isNextEnabled={isCurrentStepValid}
              submitLabel={submitLabel}
              nextLabel={nextLabel}
              prevLabel={prevLabel}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <FormProvider>
      <FormContent />
    </FormProvider>
  );
};

ModalForm.propTypes = {
  /** Form content, should be FormStep components */
  children: PropTypes.node.isRequired,
  /** Initial form data */
  initialData: PropTypes.object,
  /** Form submission handler */
  onSubmit: PropTypes.func.isRequired,
  /** Modal title */
  title: PropTypes.string,
  /** Controls modal visibility */
  isOpen: PropTypes.bool.isRequired,
  /** Modal close handler */
  onClose: PropTypes.func.isRequired,
  /** Require validation to pass before proceeding to next step */
  validateBeforeNext: PropTypes.bool,
  /** Label for submit button */
  submitLabel: PropTypes.string,
  /** Label for next button */
  nextLabel: PropTypes.string,
  /** Label for previous button */
  prevLabel: PropTypes.string,
};

ModalForm.defaultProps = {
  initialData: {},
  title: 'Form',
  validateBeforeNext: true,
  submitLabel: 'Submit',
  nextLabel: 'Next',
  prevLabel: 'Back',
};

export default ModalForm; 