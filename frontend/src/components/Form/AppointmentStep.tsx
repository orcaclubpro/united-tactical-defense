import React, { useEffect, useState } from 'react';
import { FormStep as FormStepType, useForm } from '../../contexts/FormContext';
import { BookingCalendar } from '../Calendar';
import { TimeSlot } from '../../services/api';
import FormStep from './FormStep';
import calendarAPIClient from '../../services/api/CalendarAPIClient';
import styled from 'styled-components';

// Styled components for error message
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

// Styled debug info (only shown in development)
const DebugInfo = styled.div`
  background-color: #e8f5e9;
  border: 1px dashed #81c784;
  border-radius: 4px;
  padding: 8px;
  margin-top: 8px;
  font-family: monospace;
  font-size: 12px;
  overflow: auto;
  max-height: 120px;
  
  strong {
    display: block;
    margin-bottom: 4px;
    color: #2e7d32;
  }
  
  code {
    color: #333;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

interface AppointmentStepProps {
  step: FormStepType;
  isActive: boolean;
  onComplete?: () => void;
  programType?: string;
  debug?: boolean;
}

/**
 * AppointmentStep is a specialized form step for appointment booking.
 * It integrates the BookingCalendar component with the FormContext.
 */
const AppointmentStep: React.FC<AppointmentStepProps> = ({
  step,
  isActive,
  onComplete,
  programType,
  debug = process.env.NODE_ENV === 'development'
}) => {
  const { formData, updateFormData } = useForm();
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    formData.date ? new Date(formData.date as string) : null
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  // Update the form context when date or time slot is selected
  useEffect(() => {
    if (selectedDate && selectedTimeSlot) {
      // Format the date in YYYY-MM-DD format
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      // Update form data with selected date and time
      updateFormData({
        date: formattedDate,
        time: selectedTimeSlot.time,
        timeSlotId: selectedTimeSlot.id,
        // Format the selected slot in the format expected by Go High Level
        selected_slot: `${formattedDate}T${selectedTimeSlot.time}:00-07:00`,
      });
      
      // If we have both date and time, check if we can automatically advance
      if (onComplete && !bookingInProgress) {
        onComplete();
      }
    }
  }, [selectedDate, selectedTimeSlot, onComplete, updateFormData, bookingInProgress]);

  // Handle date selection
  const handleDateSelected = (date: Date) => {
    setSelectedDate(date);
    const formattedDate = date.toISOString().split('T')[0];
    updateFormData('date', formattedDate);
    
    // Clear any previous time slot when date changes
    if (selectedTimeSlot) {
      setSelectedTimeSlot(null);
      updateFormData('time', null);
      updateFormData('timeSlotId', null);
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelected = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    updateFormData('time', timeSlot.time);
    updateFormData('timeSlotId', timeSlot.id);
    
    // Format the selected slot in the format expected by Go High Level
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      updateFormData('selected_slot', `${formattedDate}T${timeSlot.time}:00-07:00`);
    }
  };
  
  // Book the appointment directly for tactical defense programs
  const handleBookNow = async () => {
    if (!selectedDate || !selectedTimeSlot || !formData.firstName || !formData.lastName || 
        !formData.email || !formData.phone) {
      setBookingError('Please fill out all required information before booking.');
      return;
    }
    
    setBookingInProgress(true);
    setBookingError(null);
    setRawResponse(null);
    
    try {
      // Format the selected date in YYYY-MM-DD format
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      // Convert time to correct format (HH:MM)
      const formattedTime = selectedTimeSlot.time;
      
      // Log submission data to the console for debugging
      console.group('📤 Appointment Submission');
      console.log('Submission data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        date: formattedDate,
        time: formattedTime,
        programType: programType || formData.program,
        timestamp: new Date().toISOString()
      });
      console.groupEnd();
      
      // Submit the booking using the specialized client
      const result = await calendarAPIClient.bookTacticalDefenseAppointment({
        firstName: formData.firstName as string,
        lastName: formData.lastName as string,
        email: formData.email as string,
        phone: formData.phone as string,
        date: formattedDate,
        time: formattedTime,
        programType: programType || (formData.program as string),
      });
      
      // Save raw response for debugging
      if (result.rawResponse) {
        setRawResponse(result.rawResponse);
      }
      
      if (result.success) {
        // Update form with appointment ID
        if (result.data?.appointmentId) {
          updateFormData('appointmentId', result.data.appointmentId);
        }
        
        // Log successful response
        console.group('✅ Appointment Success');
        console.log('Response:', result);
        console.groupEnd();
        
        // Handle success
        if (onComplete) {
          onComplete();
        }
      } else {
        // Log error response
        console.group('❌ Appointment Error');
        console.error('Error details:', {
          message: result.message,
          error: result.error,
          statusCode: result.statusCode,
          raw: result.rawResponse
        });
        console.groupEnd();
        
        // Display the user-friendly error message from the API
        setBookingError(result.message || result.error || 'Failed to book appointment. Please try again.');
      }
    } catch (error: any) {
      // Log unexpected error
      console.group('💥 Unexpected Error');
      console.error('Error:', error);
      console.groupEnd();
      
      setBookingError(error.message || 'An unexpected error occurred.');
      setRawResponse(error);
    } finally {
      setBookingInProgress(false);
    }
  };

  // Function to render detailed debug info when enabled
  const renderDebugInfo = () => {
    if (!debug || !rawResponse) return null;
    
    return (
      <DebugInfo>
        <strong>Debug Information:</strong>
        <code>
          {typeof rawResponse === 'object' 
            ? JSON.stringify(rawResponse, null, 2)
            : String(rawResponse)
          }
        </code>
      </DebugInfo>
    );
  };

  return (
    <FormStep step={step} isActive={isActive} onComplete={onComplete}>
      <div className="appointment-step">
        <h3 className="step-title">Select Appointment Date & Time</h3>
        <p className="step-description">
          Please select a date and time for your tactical defense training session.
        </p>
        
        <BookingCalendar
          onDateSelected={handleDateSelected}
          onTimeSlotSelected={handleTimeSlotSelected}
          preselectedDate={formData.date as string}
          programType={programType || (formData.program as string)}
        />
        
        {selectedDate && selectedTimeSlot && (
          <div className="appointment-summary">
            <h4>Your Selected Appointment</h4>
            <p>
              <strong>Date:</strong> {selectedDate.toLocaleDateString()}
            </p>
            <p>
              <strong>Time:</strong> {selectedTimeSlot.time}
            </p>
            
            {bookingError && (
              <>
                <ErrorMessage>
                  {bookingError}
                </ErrorMessage>
                {renderDebugInfo()}
              </>
            )}
            
            <button 
              className="book-now-button"
              onClick={handleBookNow}
              disabled={bookingInProgress}
            >
              {bookingInProgress ? 'Booking...' : 'Book Now'}
            </button>
          </div>
        )}
      </div>
    </FormStep>
  );
};

export default AppointmentStep; 