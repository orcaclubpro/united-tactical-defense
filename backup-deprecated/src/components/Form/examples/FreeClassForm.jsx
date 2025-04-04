import React, { useState } from 'react';
import ModalForm from '../ModalForm';
import FormStep from '../FormStep';
import { createStepValidator } from '../../../services/validation/formValidator';

/**
 * Free Class Form Example
 * 
 * Example implementation of a multi-step form for booking a free class.
 */
const FreeClassForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Open the modal form
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSubmissionResult(null);
  };

  // Close the modal form
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle form submission
  const handleSubmit = async (formData) => {
    // Simulated API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Form submitted:', formData);
        setSubmissionResult({
          success: true,
          message: 'Your free class has been booked successfully!',
        });
        resolve(formData);
      }, 1000);
    });
  };

  // Validation rules for each step
  const personalInfoValidator = createStepValidator({
    firstName: { required: true },
    lastName: { required: true },
    email: { required: true, email: true },
    phone: { required: true, phone: true },
  });

  const classInfoValidator = createStepValidator({
    classType: { required: true },
    experience: { required: true },
  });

  return (
    <div className="free-class-form-demo">
      <h1>United Tactical Defense</h1>
      
      <button 
        className="open-modal-button"
        onClick={handleOpenModal}
      >
        Book Your Free Class
      </button>

      {submissionResult && submissionResult.success && (
        <div className="success-message">
          {submissionResult.message}
        </div>
      )}

      <ModalForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        title="Book Your Free Class"
        validateBeforeNext={true}
        submitLabel="Book Now"
      >
        {/* Step 1: Personal Information */}
        <FormStep 
          stepIndex={0}
          validate={personalInfoValidator}
        >
          <h3>Personal Information</h3>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input 
              type="text" 
              id="firstName" 
              name="firstName" 
              placeholder="Enter your first name"
              data-testid="firstName-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input 
              type="text" 
              id="lastName" 
              name="lastName" 
              placeholder="Enter your last name"
              data-testid="lastName-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Enter your email address"
              data-testid="email-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              placeholder="Enter your phone number"
              data-testid="phone-input"
            />
          </div>
        </FormStep>

        {/* Step 2: Class Information */}
        <FormStep 
          stepIndex={1}
          validate={classInfoValidator}
        >
          <h3>Class Information</h3>
          <div className="form-group">
            <label htmlFor="classType">Class Type</label>
            <select 
              id="classType" 
              name="classType"
              data-testid="classType-select"
            >
              <option value="">Select a class type</option>
              <option value="self-defense">Self Defense</option>
              <option value="firearms">Firearms Training</option>
              <option value="situational">Situational Awareness</option>
              <option value="tactical">Tactical Training</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="experience">Experience Level</label>
            <select 
              id="experience" 
              name="experience"
              data-testid="experience-select"
            >
              <option value="">Select your experience level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </FormStep>

        {/* Step 3: Appointment Selection */}
        <FormStep stepIndex={2}>
          <h3>Select Appointment Time</h3>
          <p>Choose a date and time for your free class:</p>
          
          <div className="calendar-placeholder">
            {/* Calendar component will be integrated here in Phase 1.2 */}
            <p>Calendar integration coming soon</p>
            
            {/* Temporary time slot selection */}
            <div className="time-slots">
              <h4>Available Time Slots</h4>
              <div className="slot">
                <input 
                  type="radio" 
                  id="slot1" 
                  name="timeSlot" 
                  value="2023-04-15T10:00:00"
                  data-testid="slot1-radio"
                />
                <label htmlFor="slot1">Saturday, April 15 - 10:00 AM</label>
              </div>
              <div className="slot">
                <input 
                  type="radio" 
                  id="slot2" 
                  name="timeSlot" 
                  value="2023-04-15T14:00:00"
                  data-testid="slot2-radio"
                />
                <label htmlFor="slot2">Saturday, April 15 - 2:00 PM</label>
              </div>
              <div className="slot">
                <input 
                  type="radio" 
                  id="slot3" 
                  name="timeSlot" 
                  value="2023-04-16T11:00:00"
                  data-testid="slot3-radio"
                />
                <label htmlFor="slot3">Sunday, April 16 - 11:00 AM</label>
              </div>
            </div>
          </div>
        </FormStep>

        {/* Step 4: Confirmation */}
        <FormStep stepIndex={3}>
          <h3>Confirm Your Booking</h3>
          <p>Please review your information before submitting:</p>
          
          <div className="confirmation-details">
            <p>By clicking "Book Now", you confirm that the information provided is accurate and agree to our terms and conditions.</p>
            
            <div className="form-group">
              <label>
                <input 
                  type="checkbox" 
                  name="termsAgreed" 
                  data-testid="terms-checkbox"
                />
                I agree to the terms and conditions
              </label>
            </div>
          </div>
        </FormStep>
      </ModalForm>
    </div>
  );
};

export default FreeClassForm; 