import React, { useEffect, useState } from 'react';
import { FormStep as FormStepType, useForm } from '../../contexts/FormContext';
import { BookingCalendar } from '../Calendar';
import { TimeSlot } from '../../services/api';
import FormStep from './FormStep';

interface AppointmentStepProps {
  step: FormStepType;
  isActive: boolean;
  onComplete?: () => void;
  programType?: string;
}

/**
 * AppointmentStep is a specialized form step for appointment booking.
 * It integrates the BookingCalendar component with the FormContext.
 */
const AppointmentStep: React.FC<AppointmentStepProps> = ({
  step,
  isActive,
  onComplete,
  programType
}) => {
  const { formData, updateFormData } = useForm();
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    formData.date ? new Date(formData.date as string) : null
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);

  // Update the form context when date or time slot is selected
  useEffect(() => {
    if (selectedDate && selectedTimeSlot) {
      // If we have both date and time, check if we can automatically advance
      if (onComplete) {
        onComplete();
      }
    }
  }, [selectedDate, selectedTimeSlot, onComplete]);

  // Handle date selection
  const handleDateSelected = (date: Date) => {
    setSelectedDate(date);
    updateFormData('date', date.toISOString().split('T')[0]);
  };

  // Handle time slot selection
  const handleTimeSlotSelected = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    updateFormData('time', timeSlot.time);
    updateFormData('timeSlotId', timeSlot.id);
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
          </div>
        )}
      </div>
    </FormStep>
  );
};

export default AppointmentStep; 