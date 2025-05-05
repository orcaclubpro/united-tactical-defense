import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UDTCalendar } from '../Calendar';
import './BookingPage.scss';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="booking-page">
      <header className="booking-header">
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          Back
        </button>
      </header>
      <div className="calendar-container">
        <UDTCalendar />
      </div>
    </div>
  );
};

export default BookingPage; 