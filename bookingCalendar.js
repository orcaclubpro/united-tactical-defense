import React, { useState } from 'react';
import { Calendar, Clock, Target, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

const UDTAppointmentBooker = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Generate calendar days with optimized algorithm
  const getDaysArray = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Pre-allocate array for performance
    const days = Array(firstDay + daysInMonth).fill(null);
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days[i] = { empty: true };
    }
    
    // Days of month with O(1) date comparison
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
  
  // Cached formatting
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentMonth);
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Tactical training timeslots
  const timeSlots = [
    { time: '9:00 AM', label: 'Morning' },
    { time: '10:30 AM', label: 'Morning' },
    { time: '12:00 PM', label: 'Midday' },
    { time: '1:30 PM', label: 'Afternoon' },
    { time: '3:00 PM', label: 'Afternoon' },
    { time: '4:30 PM', label: 'Evening' },
    { time: '6:00 PM', label: 'Evening' }
  ];
  
  // Navigate months with boundary checks
  const changeMonth = (increment) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    
    // Enforce reasonable boundaries (12 months into future)
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 12);
    
    if (increment < 0 && newMonth < new Date()) {
      // Don't go before current month
      return;
    } else if (increment > 0 && newMonth > maxDate) {
      // Don't go beyond 12 months ahead
      return;
    }
    
    setCurrentMonth(newMonth);
  };
  
  // Format selected date with performance optimization
  const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };
  
  // Check if previous month button should be disabled
  const isPrevDisabled = () => {
    const today = new Date();
    return currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg max-w-md mx-auto overflow-hidden border border-red-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-4">
        <div className="flex items-center justify-center mb-2">
          <Shield className="w-5 h-5 mr-2" />
          <h2 className="text-xl font-bold tracking-tight">UNITED DEFENSE TACTICAL</h2>
        </div>
        <p className="text-sm text-center uppercase tracking-wider font-semibold">Anaheim Hills Firearms Training</p>
      </div>
      
      {/* Body */}
      <div className="p-4 bg-gray-900 text-gray-100">
        {/* Training Info */}
        <div className="flex items-center mb-4 text-sm border-b border-red-800 pb-3">
          <div className="flex items-center mr-3">
            <Clock className="w-4 h-4 mr-1 text-red-500" /> 
            <span>90 Min</span>
          </div>
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-1 text-red-500" /> 
            <span>Simulator Training</span>
          </div>
        </div>
        
        {/* Calendar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3 bg-gray-800 rounded p-2">
            <button 
              onClick={() => changeMonth(-1)}
              disabled={isPrevDisabled()}
              className={`p-1 rounded-full h-7 w-7 flex items-center justify-center
                ${isPrevDisabled() ? 'text-gray-600 cursor-not-allowed' : 'text-red-500 hover:bg-gray-700'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-sm font-medium text-center">
              {monthName} {currentMonth.getFullYear()}
            </div>
            <button 
              onClick={() => changeMonth(1)}
              className="p-1 rounded-full h-7 w-7 flex items-center justify-center text-red-500 hover:bg-gray-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdays.map(day => (
              <div key={day} className="text-xs font-medium text-gray-400 py-1">
                {day}
              </div>
            ))}
            
            {getDaysArray().map((day, i) => (
              <div 
                key={i}
                className={`text-xs py-2 rounded-full w-8 h-8 mx-auto flex items-center justify-center
                  ${day.empty ? '' : 'cursor-pointer'}
                  ${day.isToday ? 'bg-red-900 font-bold border border-red-500' : ''}
                  ${day.isPast ? 'text-gray-600' : ''}
                  ${selectedDate && day.date && selectedDate.toDateString() === day.date.toDateString() 
                      ? 'bg-red-700 text-white' : day.empty ? '' : 'hover:bg-gray-700'}`}
                onClick={() => !day.empty && !day.isPast && setSelectedDate(day.date)}
              >
                {day.empty ? '' : day.day}
              </div>
            ))}
          </div>
        </div>
        
        {/* Time slots - only show if date is selected */}
        {selectedDate && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2 flex items-center text-white">
              <Calendar className="w-4 h-4 mr-1 text-red-500" /> {formatDate(selectedDate)}
            </h3>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {timeSlots.map((slot, i) => (
                <div 
                  key={i}
                  className={`text-xs p-2 text-center cursor-pointer transition-all duration-200
                    border rounded-md flex flex-col justify-center items-center
                    ${selectedSlot === i 
                      ? 'bg-red-700 text-white border-red-500' 
                      : 'border-gray-700 hover:border-red-500 bg-gray-800'}`}
                  onClick={() => setSelectedSlot(i)}
                >
                  <span className="font-medium">{slot.time}</span>
                  <span className="text-xs opacity-75 mt-1">{slot.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Notes */}
        <div className="mt-5 text-xs text-gray-400 italic px-1 py-3 border-t border-gray-800">
          <p>You may bring 1 guest to your tactical training session. No separate booking required.</p>
        </div>
        
        {/* Action button */}
        <button 
          className={`w-full mt-4 py-3 rounded font-medium uppercase tracking-wider transition-all duration-200
            ${selectedDate && selectedSlot !== null
              ? 'bg-gradient-to-r from-red-800 to-red-700 text-white hover:from-red-700 hover:to-red-600 shadow-lg' 
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
          disabled={!selectedDate || selectedSlot === null}
        >
          Secure Your Training Slot
        </button>
      </div>
    </div>
  );
};

export default UDTAppointmentBooker;
