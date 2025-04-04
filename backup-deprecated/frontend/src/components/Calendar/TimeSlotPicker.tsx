import React, { useState, useEffect } from 'react';
import { TimeSlot } from '../../services/api';
import './Calendar.scss';

interface TimeSlotPickerProps {
  date: string;
  timeSlots: TimeSlot[];
  onTimeSlotSelected: (timeSlot: TimeSlot) => void;
  selectedTimeSlot?: TimeSlot | null;
  isLoading?: boolean;
  error?: string | null;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  date,
  timeSlots,
  onTimeSlotSelected,
  selectedTimeSlot,
  isLoading = false,
  error = null
}) => {
  const [localSelectedSlot, setLocalSelectedSlot] = useState<TimeSlot | null>(selectedTimeSlot || null);
  
  // Update local state when prop changes
  useEffect(() => {
    setLocalSelectedSlot(selectedTimeSlot || null);
  }, [selectedTimeSlot]);
  
  // Handle time slot selection
  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    if (!timeSlot.available) return;
    
    setLocalSelectedSlot(timeSlot);
    onTimeSlotSelected(timeSlot);
  };
  
  // Group time slots by time of day (morning, afternoon, evening)
  const groupTimeSlotsByTimeOfDay = () => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];
    
    timeSlots.forEach(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });
    
    return { morning, afternoon, evening };
  };
  
  // Render time slots by time of day
  const renderTimeSlotGroup = (title: string, slots: TimeSlot[]) => {
    if (slots.length === 0) return null;
    
    return (
      <div className="time-slot-group">
        <h4 className="time-slot-group-title">{title}</h4>
        <div className="time-slots-grid">
          {slots.map(slot => (
            <div
              key={slot.id}
              className={`time-slot ${slot.available ? 'available' : 'unavailable'} ${localSelectedSlot?.id === slot.id ? 'selected' : ''}`}
              onClick={() => slot.available && handleTimeSlotClick(slot)}
            >
              {slot.time}
              {slot.remaining !== undefined && slot.available && (
                <span className="remaining-slots">
                  {slot.remaining === 1 ? '1 spot left' : `${slot.remaining} spots`}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Display loading state
  if (isLoading) {
    return (
      <div className="time-slots-container">
        <div className="time-slots-loading">Loading available times...</div>
      </div>
    );
  }
  
  // Display error state
  if (error) {
    return (
      <div className="time-slots-container">
        <div className="time-slots-error">{error}</div>
      </div>
    );
  }
  
  // Display empty state
  if (timeSlots.length === 0) {
    return (
      <div className="time-slots-container">
        <div className="time-slots-empty">
          No time slots available for {new Date(date).toLocaleDateString()}. 
          Please select another date.
        </div>
      </div>
    );
  }
  
  // Group the time slots
  const { morning, afternoon, evening } = groupTimeSlotsByTimeOfDay();
  
  return (
    <div className="time-slots-container">
      <h3 className="time-slots-title">
        Available Times for {new Date(date).toLocaleDateString()}
      </h3>
      
      {renderTimeSlotGroup('Morning', morning)}
      {renderTimeSlotGroup('Afternoon', afternoon)}
      {renderTimeSlotGroup('Evening', evening)}
      
      {localSelectedSlot && (
        <div className="selected-slot-summary">
          <p>You selected: <strong>{localSelectedSlot.time}</strong> on <strong>{new Date(date).toLocaleDateString()}</strong></p>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker; 