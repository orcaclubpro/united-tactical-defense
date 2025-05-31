import React from 'react';
import UDTCalendar from './UDTCalendar';

const TestCalendar: React.FC = () => {
  const handleDateSelected = (date: Date) => {
    console.log('Date selected:', date);
  };

  const handleTimeSlotSelected = (slot: { id: string; time: string; label: string }) => {
    console.log('Time slot selected:', slot);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>Calendar Test</h1>
      <UDTCalendar 
        onDateSelected={handleDateSelected}
        onTimeSlotSelected={handleTimeSlotSelected}
      />
    </div>
  );
};

export default TestCalendar; 