import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UDTCalendar } from '../Calendar';
import { submitFreeClassForm } from '../../services/api';
import styled from 'styled-components';
import './BookingPage.scss';
import useAnalytics from '../../utils/useAnalytics';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zipCode: string;
  experience: string;
  appointmentDate: Date | null;
  appointmentTime: string;
  timeSlotId: string;
}

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/images/pattern.png') repeat;
    opacity: 0.03;
    pointer-events: none;
  }
`;

const NavBar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  @media (max-width: 768px) {
    height: 50px;
    padding: 0 16px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 1rem;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  svg {
    width: 16px;
    height: 16px;
    stroke: #e0e0e0;
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 6px 12px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 100px 40px 60px;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 40px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    padding: 100px 20px 40px;
  }

  @media (max-width: 768px) {
    padding: 70px 16px 30px;
    gap: 24px;
    min-height: calc(100vh - 50px);
    display: flex;
    flex-direction: column-reverse;
    margin-top: 0;
  }
`;

const FormSection = styled.div`
  background: #2a2a2a;
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  padding: 40px;
  height: fit-content;
  position: sticky;
  top: 100px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);

  @media (max-width: 1200px) {
    position: static;
    margin-bottom: 40px;
  }

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 12px;
    margin-top: 0;
    position: relative;
    top: 0;
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 24px;
  }
`;

const FormHeader = styled.div`
  margin-bottom: 32px;
  text-align: center;

  h1 {
    font-size: 2rem;
    color: #ffffff;
    margin-bottom: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  p {
    color: #a0a0a0;
    font-size: 1.1rem;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    margin-bottom: 24px;
    padding-top: 0;

    h1 {
      font-size: 1.5rem;
      margin-bottom: 8px;
    }

    p {
      font-size: 0.95rem;
    }
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
`;

const FormField = styled.div`
  margin-bottom: 24px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #e0e0e0;
    font-size: 0.95rem;
    letter-spacing: 0.3px;
  }

  input, select {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.2s;
    background: #1a1a1a;
    color: #ffffff;
    letter-spacing: 0.3px;

    &:focus {
      outline: none;
      border-color: #b71c1c;
      background: #1f1f1f;
      box-shadow: 0 0 0 3px rgba(183, 28, 28, 0.1);
    }

    &::placeholder {
      color: #666;
    }
  }

  .error-message {
    color: #ff6b6b;
    font-size: 0.875rem;
    margin-top: 6px;
    letter-spacing: 0.2px;
  }

  @media (max-width: 768px) {
    margin-bottom: 16px;

    label {
      font-size: 0.9rem;
      margin-bottom: 6px;
    }

    input, select {
      padding: 12px 14px;
      font-size: 0.95rem;
    }
  }
`;

const CalendarSection = styled.div`
  background: #2a2a2a;
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  padding: 40px;
  height: fit-content;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 12px;
    margin-top: 0;
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 24px;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #b71c1c 0%, #880e0e 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(183, 28, 28, 0.2);
  margin-top: 32px;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(183, 28, 28, 0.3);

    &:before {
      opacity: 1;
    }
  }

  &:disabled {
    background: #333;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    padding: 14px 24px;
    font-size: 1rem;
    margin-top: 24px;
  }
`;

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 32px;
  padding: 12px 16px;
  background: #1a1a1a;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .step {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #a0a0a0;
    font-size: 0.9rem;
    transition: all 0.2s;

    &.active {
      color: #b71c1c;
      font-weight: 500;
    }

    .number {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #333;
      color: #a0a0a0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      transition: all 0.2s;

      &.active {
        background: #b71c1c;
        color: white;
      }
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 24px;
    padding: 10px 12px;
    gap: 16px;

    .step {
      font-size: 0.8rem;
      gap: 6px;

      .number {
        width: 20px;
        height: 20px;
        font-size: 0.75rem;
      }
    }
  }
`;

const SuccessPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #2a2a2a;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  text-align: center;
  z-index: 2000;
  max-width: 500px;
  width: 90%;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);

  h2 {
    color: #4caf50;
    margin-bottom: 16px;
    font-size: 1.5rem;
    letter-spacing: 0.5px;
  }

  p {
    color: #e0e0e0;
    margin-bottom: 24px;
    line-height: 1.6;
    letter-spacing: 0.3px;
  }

  button {
    background: #b71c1c;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    letter-spacing: 0.3px;

    &:hover {
      background: #880e0e;
      transform: translateY(-2px);
    }
  }

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 12px;

    h2 {
      font-size: 1.3rem;
      margin-bottom: 12px;
    }

    p {
      font-size: 0.95rem;
      margin-bottom: 20px;
    }

    button {
      padding: 10px 20px;
      font-size: 0.95rem;
    }
  }
`;

const ErrorPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #2a2a2a;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  text-align: center;
  z-index: 2000;
  max-width: 500px;
  width: 90%;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);

  h2 {
    color: #ff6b6b;
    margin-bottom: 16px;
    font-size: 1.5rem;
    letter-spacing: 0.5px;
  }

  p {
    color: #e0e0e0;
    margin-bottom: 24px;
    line-height: 1.6;
    letter-spacing: 0.3px;
  }

  button {
    background: #b71c1c;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    letter-spacing: 0.3px;

    &:hover {
      background: #880e0e;
      transform: translateY(-2px);
    }
  }

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 12px;

    h2 {
      font-size: 1.3rem;
      margin-bottom: 12px;
    }

    p {
      font-size: 0.95rem;
      margin-bottom: 20px;
    }

    button {
      padding: 10px 20px;
      font-size: 0.95rem;
    }
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1999;
`;

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { trackForm } = useAnalytics();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zipCode: '',
    experience: 'beginner',
    appointmentDate: null,
    appointmentTime: '',
    timeSlotId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
    setCurrentStep(2);
  };

  const handleTimeSlotSelected = (slot: { id: string; time: string; label: string }) => {
    setFormData(prev => ({
      ...prev,
      appointmentTime: slot.time,
      timeSlotId: slot.id
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Please select a date';
    if (!formData.appointmentTime) newErrors.appointmentTime = 'Please select a time slot';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Format date with timezone for API
      let selectedSlot = '';
      if (formData.appointmentDate && formData.appointmentTime) {
        const date = new Date(formData.appointmentDate);
        const timeMatch = formData.appointmentTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!timeMatch) {
          throw new Error('Invalid time format');
        }
        
        let [_, hours, minutes, period] = timeMatch;
        let hour = parseInt(hours);
        const minute = parseInt(minutes);
        
        if (period.toUpperCase() === 'PM' && hour < 12) {
          hour += 12;
        } else if (period.toUpperCase() === 'AM' && hour === 12) {
          hour = 0;
        }
        
        date.setHours(hour, minute, 0, 0);
        
        // Check if the appointment is within 12 hours
        const now = new Date();
        const diffInMs = date.getTime() - now.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);
        
        if (diffInHours < 12) {
          throw new Error('Appointments must be scheduled at least 12 hours in advance.');
        }
        
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const formattedHours = hour.toString().padStart(2, '0');
        const formattedMinutes = minute.toString().padStart(2, '0');
        
        selectedSlot = `${year}-${month}-${day}T${formattedHours}:${formattedMinutes}:00-07:00`;
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
        tag: "landing",
        eventData: {
          source: "website",
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

      // Create multipart form data
      const formDataObj = new FormData();
      formDataObj.append('formData', JSON.stringify(apiFormData));
      formDataObj.append('locationId', 'wCjIiRV3L99XP2J5wYdA');
      formDataObj.append('formId', 'bHbGRJjmTWG67GNRFqQY');
      formDataObj.append('captchaV3', 'CAPTCHA_TOKEN_PLACEHOLDER_' + sessionId);

      // Send request to leadconnector endpoint
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
        console.error('Failed to parse response:', e);
        throw new Error('Failed to process the response from the appointment service');
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to book appointment');
      }

      // Track conversion in Google Analytics
      trackForm('free_lesson', {
        id: responseData.id || `form_${Date.now()}`,
        source: 'website',
        experience: formData.experience,
        appointmentDate: formData.appointmentDate
      });

      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to book appointment. Please try again.');
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <NavBar>
        <BackButton onClick={() => navigate('/')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </BackButton>
      </NavBar>

      <ContentWrapper>
        <FormSection>
          <FormHeader>
            <h1>Schedule Your Training</h1>
            <p>Book your 90-minute personalized tactical defense training session today</p>
          </FormHeader>

          <ProgressIndicator>
            <div className={`step ${currentStep === 1 ? 'active' : ''}`}>
              <div className={`number ${currentStep === 1 ? 'active' : ''}`}>1</div>
              <span>Your Information</span>
            </div>
            <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
              <div className={`number ${currentStep === 2 ? 'active' : ''}`}>2</div>
              <span>Select Time</span>
            </div>
          </ProgressIndicator>
          
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
              value={formData.zipCode}
              onChange={handleInputChange}
              placeholder="Your zip code"
            />
          </FormField>
          
          <FormField>
            <label htmlFor="experience">Prior Experience</label>
            <select
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
            >
              <option value="none">No prior experience</option>
              <option value="beginner">Beginner (0-1 year)</option>
              <option value="intermediate">Intermediate (1-3 years)</option>
              <option value="advanced">Advanced (3+ years)</option>
            </select>
          </FormField>

          <SubmitButton 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Schedule My Session'}
          </SubmitButton>
          
          {errors.submit && (
            <div className="error-message" style={{ marginTop: '16px', textAlign: 'center' }}>
              {errors.submit}
            </div>
          )}
        </FormSection>

        <CalendarSection>
          <UDTCalendar 
            onDateSelected={handleDateSelected}
            onTimeSlotSelected={handleTimeSlotSelected}
          />
        </CalendarSection>
      </ContentWrapper>

      {showSuccess && (
        <>
          <Overlay />
          <SuccessPopup>
            <h2>Appointment Confirmed!</h2>
            <p>
              Your 90-minute tactical defense class has been scheduled. We've sent a confirmation
              email to {formData.email} with all the details.
            </p>
            <p>
              Please arrive 10 minutes before your scheduled time. Our instructor is looking 
              forward to meeting you!
            </p>
            <button onClick={() => navigate('/')}>Return to Home</button>
          </SuccessPopup>
        </>
      )}

      {showError && (
        <>
          <Overlay />
          <ErrorPopup>
            <h2>Error</h2>
            <p>{errorMessage}</p>
            <button onClick={() => setShowError(false)}>Try Again</button>
          </ErrorPopup>
        </>
      )}
    </PageContainer>
  );
};

export default BookingPage; 