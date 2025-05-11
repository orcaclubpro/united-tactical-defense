import React, { useState, useEffect } from 'react';
import ModernModalUI from './ModernModalUI';
import styled from 'styled-components';
import UDTCalendar from '../Calendar/UDTCalendar';
import { submitFreeClassForm } from '../../services/api';
import useAnalytics from '../../utils/useAnalytics';
import { getCityFromZip } from '../../utils/zipUtils';
import useZapier from '../../hooks/useZapier';

interface FreeLessonFormControllerProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialData?: Partial<FormData>;
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
  zipCode?: string;
  [key: string]: any;
}

// Styled components for enhanced UI
const FormWrapper = styled.div`
  max-width: 100%;
  background-color: #1e1f21;
  color: #e0e0e0;
  padding: 0 0 10px 0;
  
  @media (max-width: 480px) {
    padding: 0 0 8px 0;
  }
`;

const FormField = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #e0e0e0;
    text-transform: uppercase;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #444;
    border-radius: 6px;
    font-size: 1rem;
    background-color: #2c2d30;
    color: #e0e0e0;
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: #b71c1c;
      box-shadow: 0 0 0 1px rgba(183, 28, 28, 0.2);
    }
    
    &::placeholder {
      color: #999;
    }
  }
  
  .error-message {
    color: #f44336;
    font-size: 0.875rem;
    margin-top: 4px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 16px;
    
    label {
      font-size: 0.8rem;
      margin-bottom: 6px;
    }
    
    input, select, textarea {
      padding: 10px 14px;
      font-size: 0.95rem;
    }
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const StepHeading = styled.h3`
  color: #f44336;
  margin-top: 0;
  margin-bottom: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  position: relative;
  padding-bottom: 10px;
  font-size: 1.5rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  
  &:after {
    display: none;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
    margin-bottom: 12px;
    padding-bottom: 8px;
  }
`;

const StepDescription = styled.p`
  margin-bottom: 24px;
  color: #999;
  font-size: 0.95rem;
  line-height: 1.5;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    margin-bottom: 20px;
    line-height: 1.4;
  }
`;

const FreeClassInfo = styled.div`
  background-color: rgba(183, 28, 28, 0.1);
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 4px solid #b71c1c;
  
  h4 {
    margin-top: 0;
    color: #f44336;
    font-size: 1.1rem;
  }
  
  ul {
    margin-bottom: 0;
    padding-left: 20px;
    color: #e0e0e0;
    
    li {
      margin-bottom: 4px;
    }
  }
`;

const ConfirmationDetails = styled.div`
  background-color: #2c2d30;
  padding: 16px;
  border-radius: 6px;
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
      color: #e0e0e0;
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
    : '1px solid #444'};
  color: ${props => props.isPrimary ? '#fff' : '#999'};
  border-radius: 6px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.isPrimary 
      ? 'linear-gradient(to right, #c62828, #9a0f0f)' 
      : 'rgba(255, 255, 255, 0.05)'};
    color: ${props => props.isPrimary ? '#fff' : '#e0e0e0'};
  }
  
  &:disabled {
    background: ${props => props.isPrimary ? '#333' : 'transparent'};
    color: #666;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    min-width: 100px;
    padding: 10px 20px;
    font-size: 0.9rem;
  }
`;

// Progress bar - make it more sleek
const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: rgba(68, 68, 68, 0.3);
  margin-bottom: 24px;
  border-radius: 2px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 480px) {
    height: 3px;
    margin-bottom: 20px;
  }
`;

const ProgressFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${props => props.percent}%;
  background: linear-gradient(to right, #b71c1c, #f44336);
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(244, 67, 54, 0.4);
`;

const ErrorMessage = styled.div`
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
  padding: 12px 16px;
  border-radius: 6px;
  margin: 16px 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  border: 1px solid rgba(244, 67, 54, 0.3);

  &::before {
    content: "⚠️";
    margin-right: 8px;
    font-size: 16px;
  }
`;

const SuccessContainer = styled.div`
  text-align: center;
  padding: 20px;
  background-color: #1e1f21;
  color: #e0e0e0;
  
  .success-icon {
    width: 80px;
    height: 80px;
    background-color: #28a745;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    margin: 0 auto 20px;
    box-shadow: 0 4px 8px rgba(40, 167, 69, 0.2);
  }
  
  h3 {
    color: #28a745;
    margin-bottom: 12px;
    font-size: 1.5rem;
  }
  
  p {
    color: #555;
    margin-bottom: 24px;
    font-size: 1rem;
    line-height: 1.5;
  }
  
  .follow-up {
    background-color: #f8f9fa;
    padding: 12px 16px;
    border-radius: 4px;
    text-align: left;
    margin-bottom: 16px;
    border-left: 3px solid #28a745;
    
    h4 {
      margin-top: 0;
      margin-bottom: 8px;
      color: #333;
      font-size: 1.1rem;
    }
    
    p {
      margin: 0;
      color: #555;
    }
  }
`;

export const FreeLessonFormController: React.FC<FreeLessonFormControllerProps> = ({
  isOpen: propIsOpen = false,
  onClose,
  initialData = {},
  formSource = 'website'
}) => {
  // Use our custom analytics hook
  const { trackForm } = useAnalytics();
  // Use our Zapier hook
  const { sendToZapier, status: zapierStatus } = useZapier();
  
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
    source: formSource,
    ...initialData
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Handle modal opening from props
  useEffect(() => {
    // Only update state if it's different from current state
    if (isOpen !== propIsOpen) {
      setIsOpen(propIsOpen);
    }
  }, [propIsOpen, isOpen]);

  // Add calendar styles when the form opens
  useEffect(() => {
    // Only add/remove class if the state has changed
    if (isOpen) {
      if (!document.body.classList.contains('modal-open')) {
        document.body.classList.add('modal-open');
      }
    } else {
      if (document.body.classList.contains('modal-open')) {
        document.body.classList.remove('modal-open');
      }
    }
    
    return () => {
      // Clean up class on unmount
      if (document.body.classList.contains('modal-open')) {
        document.body.classList.remove('modal-open');
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    if (onClose) onClose();
    setIsOpen(false);
    document.body.classList.remove('modal-open');
    
    // Reset form after closing animation
    setTimeout(() => {
      if (!submissionSuccess) {
        setCurrentStep(0);
        setSubmissionError(null);
      }
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateSelected = (date: Date) => {
    setFormData(prev => ({
      ...prev,
      appointmentDate: date
    }));
    
    // Clear error
    if (errors.appointmentDate) {
      setErrors(prev => ({
        ...prev,
        appointmentDate: ''
      }));
    }
  };

  const handleTimeSlotSelected = (timeSlot: any) => {
    setFormData(prev => ({
      ...prev,
      appointmentTime: timeSlot.time,
      timeSlotId: timeSlot.id
    }));
    
    // Clear error
    if (errors.appointmentTime) {
      setErrors(prev => ({
        ...prev,
        appointmentTime: ''
      }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Different validation rules based on the current step
    if (currentStep === 0) {
      // Personal Information
      if (!formData.firstName?.trim()) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!formData.lastName?.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      
      if (!formData.email?.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      if (!formData.phone?.trim()) {
        newErrors.phone = 'Phone number is required';
      }
      
      // Optional validation for zip code - only validate if provided
      if (formData.zipCode?.trim() && !/^\d{5}(-\d{4})?$/.test(formData.zipCode.trim())) {
        newErrors.zipCode = 'Please enter a valid zip code';
      }
    } else if (currentStep === 1) {
      // Appointment
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

  const handleNext = async () => {
    const isValid = validateCurrentStep();
    
    if (isValid) {
      if (currentStep === 0) {
        // Send data to Zapier webhook when user clicks "Choose Date & Time"
        const zapierData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          zipCode: formData.zipCode, // Changed from zip to zipCode to match the field name
          email: formData.email,
          phone: formData.phone,
          experience: formData.experience,
          source: formData.source || 'website'
        };
        
        // Send to Zapier but don't block form progression
        sendToZapier(zapierData, "landing");
      }

      if (currentStep < 2) {
        setCurrentStep(prev => prev + 1);
      } else {
        await handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmissionError(null);
    
    try {
      // Format date with timezone for API
      let selectedSlot = '';
      if (formData.appointmentDate && formData.appointmentTime) {
        // Create a new date object from the selected date
        const date = new Date(formData.appointmentDate);
        
        // Parse the time string (format: "HH:MM AM/PM")
        const timeMatch = formData.appointmentTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!timeMatch) {
          throw new Error('Invalid time format');
        }
        
        let [_, hours, minutes, period] = timeMatch;
        let hour = parseInt(hours);
        const minute = parseInt(minutes);
        
        // Convert to 24-hour format
        if (period.toUpperCase() === 'PM' && hour < 12) {
          hour += 12;
        } else if (period.toUpperCase() === 'AM' && hour === 12) {
          hour = 0;
        }
        
        // Set the hours and minutes on the date object
        date.setHours(hour, minute, 0, 0);
        
        // Check if the appointment is within 12 hours
        const now = new Date();
        const diffInMs = date.getTime() - now.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);
        
        if (diffInHours < 12) {
          throw new Error('Appointments must be scheduled at least 12 hours in advance.');
        }
        
        // Format the date string with timezone
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const formattedHours = hour.toString().padStart(2, '0');
        const formattedMinutes = minute.toString().padStart(2, '0');
        
        // Use Pacific Time (PT) timezone offset
        selectedSlot = `${year}-${month}-${day}T${formattedHours}:${formattedMinutes}:00-07:00`;
        
        console.log('Formatted date:', selectedSlot);
      } else {
        throw new Error('Date and time are required');
      }
      
      // Generate unique identifiers
      const sessionId = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
      const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      
      // Create the form data object required by external API
      const apiFormData = {
        cLNizIhBIdwpbrfvmqH8: [],
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: `+1${formData.phone.replace(/\D/g, '')}`,
        email: formData.email,
        formId: "bHbGRJjmTWG67GNRFqQY",
        location_id: "wCjIiRV3L99XP2J5wYdA",
        calendar_id: "EwO4iAyVRl5dqwH9pi1O",
        selected_slot: selectedSlot,
        selected_timezone: "America/Los_Angeles",
        sessionId,
        tag: "landing", // Add tag field to the payload
        eventData: {
          source: formData.source || "direct",
          referrer: document.referrer || "https://uniteddefensetactical.com/",
          url_params: {},
          page: {
            url: window.location.href,
            title: "UDT Free Demo Training"
          },
          timestamp: Date.now(),
          campaign: "",
          contactSessionIds: {
            ids: [sessionId]
          },
          type: "page-visit",
          parentId: "0QbcKCTjT25VUqQhEKpj",
          pageVisitType: "funnel",
          domain: "uniteddefensetactical.com",
          version: "v3",
          fingerprint: null,
          fbEventId: generateUUID(),
          medium: "calendar",
          mediumId: "EwO4iAyVRl5dqwH9pi1O"
        },
        sessionFingerprint: generateUUID(),
        funneEventData: {
          event_type: "optin",
          domain_name: "uniteddefensetactical.com",
          page_url: "/calendar-free-pass",
          funnel_id: "U24FpiHkrMhcsvps5TR1",
          page_id: "0QbcKCTjT25VUqQhEKpj",
          funnel_step_id: "e451b167-1a02-436c-8df1-66dd8d5c1fe4"
        },
        dateFieldDetails: [],
        Timezone: "America/Los_Angeles (GMT-07:00)",
        paymentContactId: {},
        timeSpent: Math.floor(Math.random() * 100) + 50
      };
      
      console.log('🔄 Submitting appointment directly to external API:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        selectedSlot
      });
      
      // Create multipart form data
      const formDataObj = new FormData();
      
      // Add formData part
      formDataObj.append('formData', JSON.stringify(apiFormData));
      formDataObj.append('locationId', 'wCjIiRV3L99XP2J5wYdA');
      formDataObj.append('formId', 'bHbGRJjmTWG67GNRFqQY');
      formDataObj.append('captchaV3', 'CAPTCHA_TOKEN_PLACEHOLDER_' + sessionId);
      
      // Send request directly to external API
      const response = await fetch('https://backend.leadconnectorhq.com/appengine/appointment', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://uniteddefensetactical.com',
          'Referer': document.referrer || 'https://uniteddefensetactical.com/',
          'fullurl': window.location.href || 'https://uniteddefensetactical.com/',
          'timezone': 'America/Los_Angeles'
        },
        body: formDataObj
      });
      
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        console.error('❌ Failed to parse response:', e);
        throw new Error('Failed to process the response from the appointment service');
      }
      
      console.log('✅ External API response:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to book appointment');
      }
      
      // Track conversion in Google Analytics 4 using our custom hook
      trackForm('free_lesson', {
        id: responseData.id || `form_${Date.now()}`,
        source: formData.source || 'website',
        experience: formData.experience,
        appointmentDate: formData.appointmentDate
      });
      
      // Success state
      setSubmissionSuccess(true);
      setCurrentStep(3); // Move to success step
      
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      setSubmissionError(error instanceof Error ? error.message : 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderContactInfoStep = () => (
    <FormWrapper className="calendar-styled-form">
      <StepHeading>Registration Form</StepHeading>
      <StepDescription>Please provide your contact details for your 90-minute free session.</StepDescription>
      
      <FormGrid>
        <FormField>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="Your first name"
          />
          {errors.firstName && <div className="error-message">{errors.firstName}</div>}
        </FormField>
        
        <FormField>
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Your last name"
          />
          {errors.lastName && <div className="error-message">{errors.lastName}</div>}
        </FormField>
      </FormGrid>
      
      <FormGrid>
        <FormField>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Your email address"
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </FormField>
        
        <FormField>
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Your phone number"
          />
          {errors.phone && <div className="error-message">{errors.phone}</div>}
        </FormField>
      </FormGrid>
      
      <FormField>
        <label htmlFor="zipCode">Zip Code</label>
        <input
          type="text"
          id="zipCode"
          name="zipCode"
          value={formData.zipCode || ''}
          onChange={handleInputChange}
          placeholder="Your zip code"
        />
        {errors.zipCode && <div className="error-message">{errors.zipCode}</div>}
      </FormField>
      
      <FormField>
        <label htmlFor="experience">Prior Experience</label>
        <select
          id="experience"
          name="experience"
          value={formData.experience}
          onChange={handleInputChange}
        >
          <option value="">Select your experience level</option>
          <option value="none">No prior experience</option>
          <option value="beginner">Beginner (0-1 year)</option>
          <option value="intermediate">Intermediate (1-3 years)</option>
          <option value="advanced">Advanced (3+ years)</option>
        </select>
        {errors.experience && <div className="error-message">{errors.experience}</div>}
      </FormField>
    </FormWrapper>
  );

  const renderAppointmentStep = () => (
    <>
      <StepHeading>Claim Your Class</StepHeading>
      <StepDescription>
        Select a date and time for your complimentary 90-minute tactical defense class.
      </StepDescription>
      
      <div className="udt-calendar">
        <UDTCalendar
          onDateSelected={handleDateSelected}
          onTimeSlotSelected={handleTimeSlotSelected}
        />
      </div>
      
      {errors.appointmentDate && <div className="error-message">{errors.appointmentDate}</div>}
      {errors.appointmentTime && <div className="error-message">{errors.appointmentTime}</div>}
    </>
  );

  const renderConfirmationStep = () => {
    // Calculate end time (90 minutes after start time)
    const calculateEndTime = (startTime: string) => {
      if (!startTime) return '';
      
      // Parse the start time string to get hours and minutes as numbers
      const [hours, minutes] = startTime.split(':').map(part => parseInt(part));
      
      // Convert to total minutes, add 90 minutes session duration
      let totalMinutes = (hours * 60) + minutes + 90;
      
      // Calculate new hours and minutes
      let endHours = Math.floor(totalMinutes / 60);
      let endMinutes = totalMinutes % 60;
      
      // Handle day wrap (for times that go past midnight)
      if (endHours >= 24) {
        endHours = endHours % 24;
      }
      
      // Format with leading zeros
      const formattedEndHours = endHours.toString().padStart(2, '0');
      const formattedEndMinutes = endMinutes.toString().padStart(2, '0');
      
      return `${formattedEndHours}:${formattedEndMinutes}`;
    };
    
    // Format time display
    const getTimeDisplay = () => {
      if (!formData.appointmentTime) return 'Not selected';
      
      // Extract hours and minutes from the time string (format: "HH:MM")
      const startTime = formData.appointmentTime;
      const endTime = calculateEndTime(startTime);
      
      // Convert to 12-hour format for display
      const formatTimeDisplay = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(part => parseInt(part));
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12; // Convert 0 to 12
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
      };
      
      return `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)} (90 minutes)`;
    };

    return (
      <FormWrapper className="calendar-styled-form">
        <StepHeading>Confirm Your Appointment</StepHeading>
        <StepDescription>
          Please review and confirm your appointment details below.
        </StepDescription>
        
        <ConfirmationDetails>
          <div className="detail-row">
            <div className="label">Name:</div>
            <div className="value">{`${formData.firstName} ${formData.lastName}`}</div>
          </div>
          <div className="detail-row">
            <div className="label">Email:</div>
            <div className="value">{formData.email}</div>
          </div>
          <div className="detail-row">
            <div className="label">Phone:</div>
            <div className="value">{formData.phone}</div>
          </div>
          {formData.zipCode && (
            <div className="detail-row">
              <div className="label">Zip Code:</div>
              <div className="value">{formData.zipCode}</div>
            </div>
          )}
          <div className="detail-row">
            <div className="label">Date:</div>
            <div className="value">
              {formData.appointmentDate ? 
                formData.appointmentDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric'
                }) : 'Not selected'}
            </div>
          </div>
          <div className="detail-row">
            <div className="label">Time:</div>
            <div className="value">{getTimeDisplay()}</div>
          </div>
          <div className="detail-row">
            <div className="label">Experience:</div>
            <div className="value">{formData.experience}</div>
          </div>
        </ConfirmationDetails>
        
        <FreeClassInfo>
          <h4>What to Expect</h4>
          <ul>
            <li>Your session will be 90 minutes of personalized training</li>
            <li>Arrive 10 minutes before your scheduled time</li>
            <li>Wear comfortable clothing you can move in</li>
            <li>Wear proper pants for a holster to attach to</li>
            <li>Same day cancellations/no shows will NOT be tolerated</li>
          </ul>
        </FreeClassInfo>
        
        {submissionError && (
          <ErrorMessage>
            {submissionError}
          </ErrorMessage>
        )}
      </FormWrapper>
    );
  };

  const renderSuccessMessage = () => (
    <SuccessContainer className="calendar-styled-success">
      <div className="success-icon">✓</div>
      <h3>Appointment Confirmed!</h3>
      <p>
        Your 90-minute tactical defense class has been scheduled. We've sent a confirmation
        email to {formData.email} with all the details.
      </p>
      <p className="next-steps">
        Please arrive 10 minutes before your scheduled time. Our instructor is looking 
        forward to meeting you!
      </p>
      <ActionButton isPrimary onClick={handleClose} style={{ marginTop: '20px' }}>
        Close
      </ActionButton>
    </SuccessContainer>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderContactInfoStep();
      case 1:
        return renderAppointmentStep();
      case 2:
        return renderConfirmationStep();
      case 3:
        return renderSuccessMessage();
      default:
        return null;
    }
  };

  const getButtonText = () => {
    if (currentStep === 0) return 'Submit';
    if (currentStep === 1) return 'Review Details';
    if (currentStep === 2) return submitting ? 'Submitting...' : 'Schedule My Session';
    return '';
  };

  const getProgress = () => {
    // Calculate progress percentage based on the current step
    return (currentStep / 3) * 100;
  };

  const renderFooterContent = () => {
    // Don't show buttons on success step
    if (currentStep === 3) return null;
    
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {currentStep > 0 ? (
          <ActionButton onClick={handlePrevious}>
            Back
          </ActionButton>
        ) : (
          <div></div> // Empty div for spacing
        )}
        
        <ActionButton 
          isPrimary 
          onClick={handleNext}
          disabled={submitting}
        >
          {getButtonText()}
        </ActionButton>
      </div>
    );
  };

  return (
    <ModernModalUI
      isOpen={isOpen}
      onClose={handleClose}
      title={
        currentStep === 4
          ? "Confirmation"
          : "United Defense Tactical"
      }
      darkMode={true}
      showHook={currentStep === 1}
      hookMessage="Limited spots available for this week!"
      footerContent={renderFooterContent()}
    >
      <div className="udt-calendar">
        {currentStep < 4 && (
          <>
            <ProgressBar>
              <ProgressFill percent={getProgress()} />
            </ProgressBar>
          </>
        )}
        
        {getStepContent()}
      </div>
    </ModernModalUI>
  );
};

export default FreeLessonFormController; 
