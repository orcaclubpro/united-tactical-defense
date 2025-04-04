import React, { useState } from 'react';
import styled from 'styled-components';

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
  
  // Time slots configuration
  const timeSlots = [
    { id: '1', time: '9:00 AM', label: 'Morning' },
    { id: '2', time: '10:30 AM', label: 'Morning' },
    { id: '3', time: '12:00 PM', label: 'Midday' },
    { id: '4', time: '1:30 PM', label: 'Afternoon' },
    { id: '5', time: '3:00 PM', label: 'Afternoon' },
    { id: '6', time: '4:30 PM', label: 'Evening' },
    { id: '7', time: '6:00 PM', label: 'Evening' }
  ];
  
  // Generate calendar days
  const getDaysArray = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Pre-allocate array for better performance
    const days = Array(firstDay + daysInMonth).fill(null);
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days[i] = { empty: true };
    }
    
    // Days of month with efficient date comparison
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dayIndex = firstDay + i - 1;
      const date = new Date(year, month, i);
      days[dayIndex] = {
        date,
        day: i,
        isToday: i === todayDate && month === todayMonth && year === todayYear,
        isPast: date < today
      };
    }
    
    return days;
  };
  
  // Month navigation with boundary checks
  const changeMonth = (increment: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    
    // Enforce reasonable boundaries (12 months into future)
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 12);
    
    if (increment < 0) {
      // Don't go before current month
      const today = new Date();
      if (newMonth.getFullYear() < today.getFullYear() || 
         (newMonth.getFullYear() === today.getFullYear() && newMonth.getMonth() < today.getMonth())) {
        return;
      }
    } else if (increment > 0 && newMonth > maxDate) {
      // Don't go beyond 12 months ahead
      return;
    }
    
    setCurrentMonth(newMonth);
  };
  
  // Check if previous month button should be disabled
  const isPrevDisabled = () => {
    const today = new Date();
    return currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };
  
  // Handle day selection
  const handleDateClick = (day: any) => {
    if (day.empty || day.isPast) return;
    
    setSelectedDate(day.date);
    setSelectedSlot(null);
    
    if (onDateSelected) {
      onDateSelected(day.date);
    }
  };
  
  // Handle time slot selection
  const handleTimeSlotClick = (index: number) => {
    setSelectedSlot(index);
    
    if (onTimeSlotSelected && selectedDate) {
      onTimeSlotSelected(timeSlots[index]);
    }
  };
  
  // Format selected date
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  // Format month name and year
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentMonth);
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <CalendarContainer>
      {/* Header */}
      <Header>
        <h2>UNITED DEFENSE TACTICAL</h2>
        <p>Anaheim Hills Firearms Training</p>
        
        <TrainingInfo>
          <div>
            <ClockIcon /> 90 Min
          </div>
          <div>
            <TargetIcon /> Simulator Training
          </div>
        </TrainingInfo>
      </Header>
      
      {/* Calendar */}
      <div className="calendar-section">
        <CalendarHeader>
          <NavigationButton 
            onClick={() => changeMonth(-1)}
            disabled={isPrevDisabled()}
          >
            <ChevronLeftIcon />
          </NavigationButton>
          
          <div className="month-title">
            {monthName} {currentMonth.getFullYear()}
          </div>
          
          <NavigationButton onClick={() => changeMonth(1)}>
            <ChevronRightIcon />
          </NavigationButton>
        </CalendarHeader>
        
        <WeekdaysRow>
          {weekdays.map(day => (
            <div key={day}>{day}</div>
          ))}
        </WeekdaysRow>
        
        <DaysGrid>
          {getDaysArray().map((day, index) => (
            <DayCell 
              key={index}
              isEmpty={day.empty}
              isToday={day.isToday}
              isPast={day.isPast}
              isSelected={selectedDate && day.date && 
                selectedDate.toDateString() === day.date.toDateString()}
              onClick={() => !day.empty && !day.isPast && handleDateClick(day)}
            >
              {day.empty ? '' : day.day}
            </DayCell>
          ))}
        </DaysGrid>
      </div>
      
      {/* Time Slots */}
      {selectedDate && (
        <TimeSlotsContainer>
          <h3>
            <CalendarIcon /> {formatDate(selectedDate)}
          </h3>
          
          <TimeSlotGrid>
            {timeSlots.map((slot, index) => (
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
      
      {/* Notes */}
      <NotesSection>
        <p>You may bring 1 guest to your tactical training session. No separate booking required.</p>
      </NotesSection>
    </CalendarContainer>
  );
};

export default UDTCalendar; 