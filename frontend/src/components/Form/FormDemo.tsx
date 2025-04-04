import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ModalForm from './ModalForm';
import FormStep from './FormStep';
import { FormProvider, FormData, FormStep as FormStepType } from '../../contexts/FormContext';
import { TextField, SelectField, Checkbox } from './FormFields';
import FormSummary from './FormSummary';
import { ABTestingVariant } from '.';
import useABTest from '../../hooks/useABTest';
import { BookingCalendar } from '../Calendar';
import userPreferencesService from '../../services/userPreferences';
import './ModernModalUI.tsx'; // For styling reference

const DemoContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  
  h1 {
    margin-bottom: 24px;
    font-size: 24px;
  }
  
  .demo-button {
    padding: 8px 16px;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 24px;
    
    &:hover {
      background-color: #40a9ff;
    }
  }
  
  .form-demo-container {
    margin-bottom: 32px;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    padding: 24px;
  }
  
  .preferences-info {
    margin-top: 16px;
    padding: 12px;
    background-color: #f5f9ff;
    border: 1px solid #d6e4ff;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .preferences-opt-in {
    margin-top: 16px;
    display: flex;
    align-items: center;
    
    input {
      margin-right: 8px;
    }
  }
`;

const FormDemo: React.FC = () => {
  const [isBasicFormOpen, setIsBasicFormOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [hasOptedIn, setHasOptedIn] = useState(userPreferencesService.hasOptedIn());
  const [savedPreferences, setSavedPreferences] = useState<Partial<FormData> | null>(null);
  
  // Load saved preferences when component mounts
  useEffect(() => {
    if (userPreferencesService.hasOptedIn()) {
      setSavedPreferences(userPreferencesService.getFormPreferences());
    }
  }, []);
  
  // Basic form steps
  const basicFormSteps: FormStepType[] = [
    {
      id: 'userInfo',
      title: 'User Information',
      fields: ['name', 'email']
    },
    {
      id: 'contact',
      title: 'Contact Details',
      fields: ['phone', 'address']
    }
  ];
  
  // Initial form data - now uses saved preferences when available
  const initialFormData: FormData = {
    name: savedPreferences?.name || '',
    email: savedPreferences?.email || '',
    phone: savedPreferences?.phone || '',
    address: savedPreferences?.address || ''
  };
  
  // To track which variant was selected
  const [formVariant, setFormVariant] = useState<string | null>(null);
  
  // Handle opt-in preference change
  const handleOptInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isOptedIn = e.target.checked;
    setHasOptedIn(isOptedIn);
    userPreferencesService.setOptIn(isOptedIn);
    
    if (isOptedIn) {
      setSavedPreferences(userPreferencesService.getFormPreferences());
    }
  };
  
  // Handle form submission with preference saving
  const handleFormSubmit = async (data: FormData) => {
    console.log('Form submitted:', data);
    
    // Save form preferences if user has opted in
    if (userPreferencesService.hasOptedIn()) {
      userPreferencesService.storeFormPreferences(data);
    }
    
    return true;
  };
  
  return (
    <DemoContainer>
      <h1>Form Component Demos</h1>
      
      {/* User Preferences Opt-in */}
      <div className="form-demo-container">
        <h2>User Preferences</h2>
        <p>Enable form pre-filling by saving your preferences.</p>
        
        <div className="preferences-opt-in">
          <input 
            type="checkbox" 
            id="preferences-opt-in" 
            checked={hasOptedIn} 
            onChange={handleOptInChange}
          />
          <label htmlFor="preferences-opt-in">
            Save my information for easier form filling in the future
          </label>
        </div>
        
        {hasOptedIn && savedPreferences && (
          <div className="preferences-info">
            <p>You have saved preferences that will be used to pre-fill forms.</p>
            <p>Last updated: {userPreferencesService.getLastVisit() ? 
              new Date(userPreferencesService.getLastVisit()!).toLocaleString() : 
              'Unknown'}</p>
          </div>
        )}
      </div>
      
      {/* Basic Form Demo */}
      <div className="form-demo-container">
        <h2>Basic Form</h2>
        <p>Basic multi-step form with validation{hasOptedIn ? ' and preference pre-filling' : ''}</p>
        
        <button 
          className="demo-button"
          onClick={() => setIsBasicFormOpen(true)}
        >
          Open Basic Form
        </button>
        
        <ModalForm
          isOpen={isBasicFormOpen}
          onClose={() => setIsBasicFormOpen(false)}
          title="Basic Form"
          steps={basicFormSteps}
          initialData={initialFormData}
          onSubmit={handleFormSubmit}
        >
          <FormStep>
            <h3>User Information</h3>
            <TextField 
              name="name" 
              label="Full Name" 
              required
            />
            <TextField 
              name="email" 
              label="Email Address" 
              type="email" 
              required
            />
          </FormStep>
          
          <FormStep>
            <h3>Contact Details</h3>
            <TextField 
              name="phone" 
              label="Phone Number" 
              required
            />
            <TextField 
              name="address" 
              label="Address" 
              required
            />
          </FormStep>
        </ModalForm>
      </div>
      
      {/* Enhanced Form with API Demo */}
      <FormWithSubmissionAPIDemo savedPreferences={savedPreferences} />
      
      <section>
        <h2>Form Layout Test</h2>
        <p>This demonstrates testing different form layouts. You've been assigned to the <strong>{formVariant || 'loading...'}</strong> variant.</p>
        
        <ABTestingVariant
          testId="form_layout_test"
          variants={{
            control: <OriginalFormLayout />,
            compact: <CompactFormLayout />
          }}
          onVariantSelected={setFormVariant}
        />
      </section>
      
      <section>
        <h2>CTA Color Test</h2>
        <p>This demonstrates testing different button colors.</p>
        
        <CTAButton onClick={() => setShowCalendar(!showCalendar)}>
          {showCalendar ? 'Hide Booking Calendar' : 'Show Booking Calendar'}
        </CTAButton>
        
        {showCalendar && (
          <div className="calendar-demo">
            <BookingCalendar />
          </div>
        )}
      </section>
    </DemoContainer>
  );
};

// Example form with submission API integration
const FormWithSubmissionAPIDemo: React.FC<{savedPreferences: Partial<FormData> | null}> = ({ savedPreferences }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Define form steps
  const formSteps: FormStepType[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      fields: ['firstName', 'lastName', 'email', 'phone']
    },
    {
      id: 'preferences',
      title: 'Program Preferences',
      fields: ['program', 'timePreference']
    },
    {
      id: 'confirmation',
      title: 'Confirm Details',
      fields: ['terms']
    }
  ];
  
  // Initial form data with preferences
  const initialFormData: FormData = {
    firstName: savedPreferences?.firstName || '',
    lastName: savedPreferences?.lastName || '',
    email: savedPreferences?.email || '',
    phone: savedPreferences?.phone || '',
    program: savedPreferences?.program || '',
    timePreference: savedPreferences?.timePreference || '',
    terms: false // Always unchecked for legal reasons
  };
  
  // Handle form submission with preference saving
  const handleFormSubmit = async (data: FormData) => {
    console.log('Enhanced form submitted:', data);
    
    // Save form preferences if user has opted in
    if (userPreferencesService.hasOptedIn()) {
      userPreferencesService.storeFormPreferences(data);
    }
    
    // Simulate API call
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1500);
    });
  };
  
  return (
    <div className="form-demo-container">
      <h2>Form with Submission API Integration</h2>
      <p>
        This demo shows the form with enhanced submission API that includes:
      </p>
      <ul>
        <li>Automatic retry on connection failures</li>
        <li>Progress tracking during submission</li>
        <li>Detailed error handling</li>
        <li>Retry button for failed submissions</li>
      </ul>
      
      <button 
        className="demo-button"
        onClick={() => setIsModalOpen(true)}
      >
        Open Form
      </button>
      
      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Free Training Session"
        steps={formSteps}
        initialData={initialFormData}
        formType="free-class"
      >
        <FormStep>
          <h3>Personal Information</h3>
          <TextField 
            name="firstName" 
            label="First Name" 
            required
          />
          <TextField 
            name="lastName" 
            label="Last Name" 
            required
          />
          <TextField 
            name="email" 
            label="Email" 
            type="email" 
            required
          />
          <TextField 
            name="phone" 
            label="Phone Number" 
            required
          />
        </FormStep>
        
        <FormStep>
          <h3>Program Preferences</h3>
          <SelectField
            name="program"
            label="Program"
            options={[
              { value: 'tactical-basics', label: 'Tactical Basics' },
              { value: 'advanced-combat', label: 'Advanced Combat' },
              { value: 'leadership', label: 'Leadership Training' }
            ]}
            required
          />
          <SelectField
            name="timePreference"
            label="Preferred Time"
            options={[
              { value: 'morning', label: 'Morning (9am-12pm)' },
              { value: 'afternoon', label: 'Afternoon (1pm-5pm)' },
              { value: 'evening', label: 'Evening (6pm-9pm)' }
            ]}
            required
          />
        </FormStep>
        
        <FormStep>
          <h3>Confirm Details</h3>
          <div className="confirmation-summary">
            <h4>Your Information:</h4>
            <FormSummary />
          </div>
          <div className="terms-container">
            <Checkbox 
              name="terms" 
              label="I agree to the terms and conditions"
              required
            />
          </div>
        </FormStep>
      </ModalForm>
    </div>
  );
};

// Original form layout component
const OriginalFormLayout: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  
  const { trackEvent } = useABTest('form_layout_test');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('submit', { email, name });
    alert(`Original form submitted with: ${name}, ${email}`);
  };
  
  return (
    <div className="form-container original">
      <h2>Original Form Layout</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="name">Full Name</label>
          <input 
            id="name" 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your full name"
          />
        </div>
        
        <div className="form-field">
          <label htmlFor="email">Email Address</label>
          <input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email address"
          />
        </div>
        
        <button type="submit" className="submit-button">
          Submit Form
        </button>
      </form>
    </div>
  );
};

// Compact form layout component (variant)
const CompactFormLayout: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  
  const { trackEvent } = useABTest('form_layout_test');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('submit', { email, name });
    alert(`Compact form submitted with: ${name}, ${email}`);
  };
  
  return (
    <div className="form-container compact">
      <h2>Compact Form Layout</h2>
      <form onSubmit={handleSubmit} className="compact-form">
        <div className="form-row">
          <div className="form-field">
            <input 
              id="compact-name" 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
            />
          </div>
          
          <div className="form-field">
            <input 
              id="compact-email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Your email"
            />
          </div>
        </div>
        
        <button type="submit" className="submit-button compact">
          Submit
        </button>
      </form>
    </div>
  );
};

// CTA Button color variants
const CTAButton: React.FC<{onClick: () => void; children: React.ReactNode}> = ({ onClick, children }) => {
  const { variant, trackEvent } = useABTest('cta_color_test');
  
  const handleClick = () => {
    trackEvent('click');
    onClick();
  };
  
  // Determine button class based on variant
  let buttonClass = 'cta-button';
  if (variant) {
    buttonClass += ` cta-${variant.id}`;
  }
  
  return (
    <button 
      className={buttonClass}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default FormDemo; 