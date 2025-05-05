import React, { useState } from 'react';
import styled from 'styled-components';
import './Calendar.scss';

// Placeholder icons - can be replaced with an icon library of your choice
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const CalendarContainer = styled.div`
  background-color: #1e1f21;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
`;

const Header = styled.div`
  background: linear-gradient(to right, #b71c1c, #880e0e);
  padding: 16px;
  color: white;
  text-align: center;
`;

const TrainingInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  div {
    display: flex;
    align-items: center;
    margin-right: 16px;
    font-size: 14px;
    
    svg {
      margin-right: 6px;
      color: #f44336;
    }
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #2c2d30;
  
  .month-title {
    font-size: 15px;
    font-weight: 500;
    color: #fff;
  }
`;

const NavigationButton = styled.button<{ disabled?: boolean }>`
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.disabled ? '#666' : '#f44336'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.disabled ? 'transparent' : 'rgba(244, 67, 54, 0.1)'};
  }
  
  &:focus {
    outline: none;
  }
`;

const WeekdaysRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 8px 0;
  
  div {
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    color: #999;
  }
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  padding: 0 12px 12px;
`;

const DayCell = styled.div<{ isToday?: boolean; isSelected?: boolean; isPast?: boolean; isEmpty?: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border-radius: 50%;
  margin: 0 auto;
  color: ${props => {
    if (props.isEmpty) return 'transparent';
    if (props.isPast) return '#666';
    if (props.isSelected) return '#fff';
    return '#e0e0e0';
  }};
  background-color: ${props => {
    if (props.isSelected) return '#b71c1c';
    if (props.isToday) return 'rgba(244, 67, 54, 0.2)';
    return 'transparent';
  }};
  border: ${props => props.isToday && !props.isSelected ? '1px solid #f44336' : 'none'};
  cursor: ${props => (props.isEmpty || props.isPast) ? 'default' : 'pointer'};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => {
      if (props.isEmpty || props.isPast) return 'transparent';
      if (props.isSelected) return '#b71c1c';
      return 'rgba(244, 67, 54, 0.1)';
    }};
  }
`;

const TimeSlotsContainer = styled.div`
  padding: 16px;
  
  h3 {
    display: flex;
    align-items: center;
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 16px;
    color: #e0e0e0;
    
    svg {
      margin-right: 8px;
      color: #f44336;
    }
  }
`;

const TimeSlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const TimeSlot = styled.div<{ isSelected?: boolean }>`
  background-color: ${props => props.isSelected ? '#b71c1c' : '#2c2d30'};
  border: 1px solid ${props => props.isSelected ? '#f44336' : '#444'};
  border-radius: 6px;
  padding: 10px 0;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  
  .time {
    font-size: 14px;
    font-weight: 500;
    color: ${props => props.isSelected ? '#fff' : '#e0e0e0'};
  }
  
  .label {
    font-size: 12px;
    color: ${props => props.isSelected ? 'rgba(255, 255, 255, 0.7)' : '#999'};
    margin-top: 4px;
  }
  
  &:hover {
    background-color: ${props => props.isSelected ? '#b71c1c' : '#3c3c3c'};
    border-color: ${props => props.isSelected ? '#f44336' : '#555'};
  }
`;

const NotesSection = styled.div`
  padding: 12px 16px;
  border-top: 1px solid #444;
  font-size: 12px;
  color: #999;
  font-style: italic;
`;

const ErrorMessage = styled.div`
  background-color: #f44336;
  color: white;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

interface UDTCalendarProps {
  onDateSelected?: (date: Date) => void;
  onTimeSlotSelected?: (slot: { id: string; time: string; label: string }) => void;
}

const UDTCalendar: React.FC<UDTCalendarProps> = ({ 
  onDateSelected, 
  onTimeSlotSelected 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Time slots configuration
  const weekdayTimeSlots = [
    { id: '1', time: '9:00 AM', label: 'Morning' },
    { id: '2', time: '10:30 AM', label: 'Morning' },
    { id: '3', time: '12:00 PM', label: 'Midday' },
    { id: '4', time: '1:30 PM', label: 'Afternoon' },
    { id: '5', time: '3:00 PM', label: 'Afternoon' },
    { id: '6', time: '4:30 PM', label: 'Evening' },
    { id: '7', time: '6:00 PM', label: 'Evening' }
  ];

  const weekendTimeSlots = [
    { id: '1', time: '9:30 AM', label: 'Morning' },
    { id: '2', time: '11:00 AM', label: 'Morning' },
    { id: '3', time: '12:30 PM', label: 'Midday' },
    { id: '4', time: '2:00 PM', label: 'Afternoon' },
    { id: '5', time: '3:30 PM', label: 'Afternoon' },
    { id: '6', time: '5:00 PM', label: 'Evening' }
  ];
  
  // Generate calendar days
  const getDaysArray = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    // Last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const dayOfWeekForFirst = firstDayOfMonth.getDay();
    
    // Calculate the number of empty cells to add at the beginning
    const emptyCellsAtStart = dayOfWeekForFirst;
    
    // Calculate the total number of days in the month
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Create the array of days to display
    const daysArray = [];
    
    // Add empty cells for days from previous month
    for (let i = 0; i < emptyCellsAtStart; i++) {
      daysArray.push({ day: 0, date: null });
    }
    
    // Add cells for days in the current month
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push({ 
        day: i, 
        date: new Date(year, month, i)
      });
    }
    
    return daysArray;
  };
  
  // Change the displayed month
  const changeMonth = (increment: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    
    // If moving back and we need to disable past months
    if (increment < 0) {
      const today = new Date();
      if (newMonth.getFullYear() < today.getFullYear() || 
          (newMonth.getFullYear() === today.getFullYear() && 
           newMonth.getMonth() < today.getMonth())) {
        return; // Don't allow past months
      }
    }
    
    // Check if the new month is beyond 30 days from today
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    if (newMonth > thirtyDaysFromNow) {
      return; // Don't allow months beyond 30 days
    }
    
    setCurrentMonth(newMonth);
    
    // Clear selected date if it's not in the new month
    if (selectedDate && 
        (selectedDate.getMonth() !== newMonth.getMonth() || 
         selectedDate.getFullYear() !== newMonth.getFullYear())) {
      setSelectedDate(null);
      setSelectedSlot(null);
    }
  };
  
  // Check if previous month navigation should be disabled
  const isPrevDisabled = () => {
    const today = new Date();
    return (
      currentMonth.getFullYear() === today.getFullYear() && 
      currentMonth.getMonth() === today.getMonth()
    );
  };
  
  // Check if next month navigation should be disabled
  const isNextDisabled = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    return nextMonth > thirtyDaysFromNow;
  };
  
  // Check if a date/time is within 12 hours of now
  const isWithinTwelveHours = (date: Date | null, time?: string) => {
    if (!date) return false;
    
    const now = new Date();
    const selectedDateTime = new Date(date);
    
    if (time) {
      // Parse the time string (format: "HH:MM AM/PM")
      const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let [_, hours, minutes, period] = timeMatch;
        let hour = parseInt(hours);
        const minute = parseInt(minutes);
        
        // Convert to 24-hour format
        if (period.toUpperCase() === 'PM' && hour < 12) {
          hour += 12;
        } else if (period.toUpperCase() === 'AM' && hour === 12) {
          hour = 0;
        }
        
        selectedDateTime.setHours(hour, minute, 0, 0);
      }
    }
    
    // Calculate the difference in milliseconds
    const diffInMs = selectedDateTime.getTime() - now.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    return diffInHours < 12;
  };
  
  // Handle date selection
  const handleDateClick = (day: any) => {
    if (day.day === 0 || isPastDate(day.date) || isBeyondThirtyDays(day.date)) return;
    
    // Check if the date is within 12 hours
    if (isWithinTwelveHours(day.date)) {
      setErrorMessage('Appointments must be scheduled at least 12 hours in advance.');
      return;
    }
    
    setErrorMessage(null);
    setSelectedDate(day.date);
    setSelectedSlot(null);
    
    if (onDateSelected) {
      onDateSelected(day.date);
    }
  };
  
  // Handle time slot selection
  const handleTimeSlotClick = (index: number) => {
    if (!selectedDate) return;
    
    const selectedTimeSlot = getTimeSlots()[index];
    
    // Check if the selected date/time is within 12 hours
    if (isWithinTwelveHours(selectedDate, selectedTimeSlot.time)) {
      setErrorMessage('Appointments must be scheduled at least 12 hours in advance.');
      return;
    }
    
    setErrorMessage(null);
    setSelectedSlot(index);
    
    if (onTimeSlotSelected) {
      onTimeSlotSelected(selectedTimeSlot);
    }
  };
  
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Check if a date is in the past
  const isPastDate = (date: Date | null) => {
    if (!date) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return date < today;
  };
  
  // Check if a date is today
  const isToday = (date: Date | null) => {
    if (!date) return false;
    
    const today = new Date();
    return (
      date.getDate() === today.getDate() && 
      date.getMonth() === today.getMonth() && 
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // Check if a date is beyond 30 days from today
  const isBeyondThirtyDays = (date: Date | null) => {
    if (!date) return false;
    
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return date > thirtyDaysFromNow;
  };
  
  // Get time slots based on the selected date
  const getTimeSlots = () => {
    if (!selectedDate) return weekdayTimeSlots;
    const dayOfWeek = selectedDate.getDay();
    return (dayOfWeek === 0 || dayOfWeek === 6) ? weekendTimeSlots : weekdayTimeSlots;
  };
  
  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  return (
    <CalendarContainer>
      <Header>
        <h3>Schedule Your Free Training Session</h3>
        <TrainingInfo>
          <div>
            <CalendarIcon />
            <span>90 minutes</span>
          </div>
          <div>
            <TargetIcon />
            <span>Personalized</span>
          </div>
          <div>
            <ClockIcon />
            <span>Flexible Hours</span>
          </div>
        </TrainingInfo>
      </Header>
      
      {errorMessage && (
        <ErrorMessage>
          {errorMessage}
        </ErrorMessage>
      )}
      
      <CalendarHeader>
        <NavigationButton 
          onClick={() => changeMonth(-1)} 
          disabled={isPrevDisabled()}
        >
          <ChevronLeftIcon />
        </NavigationButton>
        
        <div className="month-title">{monthYear}</div>
        
        <NavigationButton 
          onClick={() => changeMonth(1)}
          disabled={isNextDisabled()}
        >
          <ChevronRightIcon />
        </NavigationButton>
      </CalendarHeader>
      
      <WeekdaysRow>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index}>{day}</div>
        ))}
      </WeekdaysRow>
      
      <DaysGrid>
        {getDaysArray().map((day, index) => (
          <DayCell 
            key={index}
            isEmpty={day.day === 0}
            isPast={isPastDate(day.date) || isBeyondThirtyDays(day.date)}
            isToday={isToday(day.date)}
            isSelected={selectedDate !== null && day.date !== null && 
              day.date.getDate() === selectedDate.getDate() && 
              day.date.getMonth() === selectedDate.getMonth()}
            onClick={() => handleDateClick(day)}
          >
            {day.day !== 0 ? day.day : ''}
          </DayCell>
        ))}
      </DaysGrid>
      
      {selectedDate && (
        <TimeSlotsContainer>
          <h3>
            <ClockIcon />
            Available Time Slots for {formatDate(selectedDate)}
          </h3>
          
          <TimeSlotGrid>
            {getTimeSlots().map((slot: { id: string; time: string; label: string }, index: number) => (
              <TimeSlot 
                key={index}
                isSelected={selectedSlot === index}
                onClick={() => handleTimeSlotClick(index)}
              >
                <div className="time">{slot.time}</div>
                <div className="label">{slot.label}</div>
              </TimeSlot>
            ))}
          </TimeSlotGrid>
        </TimeSlotsContainer>
      )}
      
      <NotesSection>
        Note: All sessions are subject to instructor availability. We'll confirm your booking via email.
      </NotesSection>
    </CalendarContainer>
  );
};

export default UDTCalendar; 
