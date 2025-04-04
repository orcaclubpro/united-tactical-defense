import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from '../../contexts/FormContext';
import { getAvailableTimeSlots, TimeSlot } from '../../services/api';
import './Calendar.scss';

interface BookingCalendarProps {
  onDateSelected?: (date: Date) => void;
  onTimeSlotSelected?: (timeSlot: TimeSlot) => void;
  preselectedDate?: string;
  programType?: string;
}

// Helper functions
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  onDateSelected,
  onTimeSlotSelected,
  preselectedDate,
  programType
}) => {
  const { formData, updateFormData } = useForm();
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    preselectedDate || null
  );
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Current view data
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const monthName = getMonthName(currentMonth);
  
  // Load available time slots for selected date
  const loadTimeSlots = useCallback(async (date: string) => {
    if (!date) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const program = programType || formData.program as string || 'default';
      const response = await getAvailableTimeSlots(date, program);
      setAvailableTimeSlots(response.data);
    } catch (err) {
      console.error('Error loading time slots:', err);
      setError('Failed to load available time slots. Please try again.');
      setAvailableTimeSlots([]);
    } finally {
      setLoading(false);
    }
  }, [formData.program, programType]);
  
  // Effect to load time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots(selectedDate);
      
      // Update form data
      updateFormData('date', selectedDate);
      
      // Notify parent component
      if (onDateSelected) {
        onDateSelected(parseDate(selectedDate));
      }
      
      // Scroll to time slots on mobile
      const isMobile = window.innerWidth < 768;
      if (isMobile && calendarRef.current) {
        setTimeout(() => {
          const timeSlotsContainer = calendarRef.current?.querySelector('.time-slots-container');
          if (timeSlotsContainer) {
            timeSlotsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }
    }
  }, [selectedDate, loadTimeSlots, onDateSelected, updateFormData]);
  
  // Add touch swipe support for navigating months
  useEffect(() => {
    const calendarElement = calendarRef.current;
    if (!calendarElement) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };
    
    const handleSwipe = () => {
      const minSwipeDistance = 50;
      if (touchStartX - touchEndX > minSwipeDistance) {
        // Swipe left - next month
        goToNextMonth();
      } else if (touchEndX - touchStartX > minSwipeDistance) {
        // Swipe right - previous month
        goToPreviousMonth();
      }
    };
    
    calendarElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    calendarElement.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      calendarElement.removeEventListener('touchstart', handleTouchStart);
      calendarElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
      setIsTransitioning(false);
    }, 150);
  };
  
  const goToNextMonth = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
      setIsTransitioning(false);
    }, 150);
  };
  
  // Selection handlers
  const handleDateClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    const formattedDate = formatDate(newDate);
    setSelectedDate(formattedDate);
  };
  
  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    if (!timeSlot.available) return;
    
    setSelectedTimeSlot(timeSlot);
    
    // Add haptic feedback for touch devices if supported
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Update form data
    updateFormData('time', timeSlot.time);
    updateFormData('timeSlotId', timeSlot.id);
    
    // Notify parent component
    if (onTimeSlotSelected) {
      onTimeSlotSelected(timeSlot);
    }
  };
  
  // Render calendar days
  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    const currentDay = today.getDate();
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const formattedDate = formatDate(date);
      const isToday = isCurrentMonth && day === currentDay;
      const isSelected = selectedDate === formattedDate;
      const isPast = date < new Date(today.setHours(0, 0, 0, 0));
      
      days.push(
        <div
          key={`day-${day}`}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
          onClick={() => !isPast && handleDateClick(day)}
          role="button"
          tabIndex={isPast ? -1 : 0}
          aria-label={`${monthName} ${day}, ${currentYear}`}
          aria-selected={isSelected}
          aria-disabled={isPast}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };
  
  // Render time slots
  const renderTimeSlots = () => {
    if (loading) {
      return <div className="time-slots-loading">Loading available times...</div>;
    }
    
    if (error) {
      return <div className="time-slots-error">{error}</div>;
    }
    
    if (!selectedDate) {
      return <div className="time-slots-empty">Please select a date to view available time slots.</div>;
    }
    
    if (availableTimeSlots.length === 0) {
      return <div className="time-slots-empty">No time slots available for the selected date. Please try another day.</div>;
    }
    
    // Group time slots by time of day for better organization
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];
    
    availableTimeSlots.forEach(slot => {
      const hour = parseInt(slot.time.split(':')[0]);
      
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });
    
    const renderTimeSlotGroup = (title: string, slots: TimeSlot[]) => {
      if (slots.length === 0) return null;
      
      return (
        <div key={title} className="time-slot-group">
          <h4 className="time-slot-group-title">{title}</h4>
          <div className="time-slots-grid">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`time-slot ${slot.available ? 'available' : 'unavailable'} ${selectedTimeSlot?.id === slot.id ? 'selected' : ''}`}
                onClick={() => slot.available && handleTimeSlotClick(slot)}
                role="button"
                tabIndex={slot.available ? 0 : -1}
                aria-label={`Time slot at ${slot.time}`}
                aria-selected={selectedTimeSlot?.id === slot.id}
                aria-disabled={!slot.available}
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
    
    return (
      <>
        {renderTimeSlotGroup('Morning', morning)}
        {renderTimeSlotGroup('Afternoon', afternoon)}
        {renderTimeSlotGroup('Evening', evening)}
        
        {selectedTimeSlot && (
          <div className="selected-slot-summary">
            <p>You selected: <strong>{selectedTimeSlot.time}</strong> on <strong>{new Date(selectedDate).toLocaleDateString()}</strong></p>
          </div>
        )}
      </>
    );
  };
  
  return (
    <div 
      className={`booking-calendar ${isTransitioning ? 'transition' : ''}`}
      ref={calendarRef}
    >
      <div className="calendar-container">
        <div className="calendar-header">
          <button 
            className="nav-button" 
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            &lt;
          </button>
          <h2 className="month-title">{`${monthName} ${currentYear}`}</h2>
          <button 
            className="nav-button" 
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            &gt;
          </button>
        </div>
        
        <div className="calendar-weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        
        <div className="calendar-days">
          {renderCalendarDays()}
        </div>
      </div>
      
      <div className="time-slots-container">
        <h3 className="time-slots-title">
          {selectedDate 
            ? `Available Times for ${new Date(selectedDate).toLocaleDateString()}` 
            : 'Select a Date to View Available Times'}
        </h3>
        {renderTimeSlots()}
      </div>
    </div>
  );
};

export default BookingCalendar; 