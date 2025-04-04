import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

export type BookingStatus = 'success' | 'error' | 'timeslot-taken' | 'pending' | 'idle';

interface BookingResponseHandlerProps {
  status: BookingStatus;
  selectedDate?: string;
  selectedTime?: string;
  onRetry?: () => void;
  onFindNewTime?: () => void;
  onClose?: () => void;
}

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const ResponseContainer = styled.div`
  padding: 24px;
  border-radius: 8px;
  animation: ${fadeIn} 0.3s ease forwards;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const SuccessContainer = styled(ResponseContainer)`
  background-color: #e8f5e9;
  border: 1px solid #a5d6a7;
`;

const ErrorContainer = styled(ResponseContainer)`
  background-color: #ffebee;
  border: 1px solid #ef9a9a;
`;

const TimeslotTakenContainer = styled(ResponseContainer)`
  background-color: #fff8e1;
  border: 1px solid #ffe082;
`;

const PendingContainer = styled(ResponseContainer)`
  background-color: #e3f2fd;
  border: 1px solid #90caf9;
`;

const IconContainer = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 32px;
`;

const SuccessIcon = styled(IconContainer)`
  background-color: #4caf50;
  color: white;
`;

const ErrorIcon = styled(IconContainer)`
  background-color: #f44336;
  color: white;
`;

const WarningIcon = styled(IconContainer)`
  background-color: #ff9800;
  color: white;
`;

const PendingIcon = styled(IconContainer)`
  background-color: #2196f3;
  color: white;
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const Message = styled.p`
  margin: 0 0 20px 0;
  font-size: 1rem;
  color: #555;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
`;

const PrimaryButton = styled(Button)`
  background-color: #007bff;
  color: white;
  border: none;
  
  &:hover {
    background-color: #0069d9;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: transparent;
  color: #6c757d;
  border: 1px solid #6c757d;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const BookingDetails = styled.div`
  background-color: rgba(255, 255, 255, 0.5);
  padding: 12px;
  border-radius: 6px;
  margin: 12px 0;
  width: 100%;
`;

const Detail = styled.p`
  margin: 4px 0;
  font-size: 0.9rem;
  
  strong {
    font-weight: 600;
  }
`;

/**
 * BookingResponseHandler displays appropriate messages and actions
 * based on the booking status.
 */
const BookingResponseHandler: React.FC<BookingResponseHandlerProps> = ({
  status,
  selectedDate,
  selectedTime,
  onRetry,
  onFindNewTime,
  onClose
}) => {
  const [formattedDate, setFormattedDate] = useState<string>('');
  
  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      setFormattedDate(date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    }
  }, [selectedDate]);
  
  if (status === 'success') {
    return (
      <SuccessContainer>
        <SuccessIcon>✓</SuccessIcon>
        <Title>Booking Confirmed!</Title>
        <Message>
          Your free tactical defense training session has been successfully booked.
        </Message>
        
        <BookingDetails>
          <Detail><strong>Date:</strong> {formattedDate}</Detail>
          <Detail><strong>Time:</strong> {selectedTime}</Detail>
        </BookingDetails>
        
        <Message>
          We've sent a confirmation to your email with all the details.
          Looking forward to seeing you!
        </Message>
        
        <PrimaryButton onClick={onClose}>Done</PrimaryButton>
      </SuccessContainer>
    );
  }
  
  if (status === 'error') {
    return (
      <ErrorContainer>
        <ErrorIcon>✕</ErrorIcon>
        <Title>Booking Failed</Title>
        <Message>
          We encountered a problem while processing your booking request.
          Please try again or contact support.
        </Message>
        
        <ButtonGroup>
          <PrimaryButton onClick={onRetry}>Try Again</PrimaryButton>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        </ButtonGroup>
      </ErrorContainer>
    );
  }
  
  if (status === 'timeslot-taken') {
    return (
      <TimeslotTakenContainer>
        <WarningIcon>!</WarningIcon>
        <Title>Time Slot No Longer Available</Title>
        <Message>
          The time slot you selected was just taken by someone else.
          Please select another time for your session.
        </Message>
        
        <ButtonGroup>
          <PrimaryButton onClick={onFindNewTime}>Find New Time</PrimaryButton>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        </ButtonGroup>
      </TimeslotTakenContainer>
    );
  }
  
  if (status === 'pending') {
    return (
      <PendingContainer>
        <PendingIcon>⟳</PendingIcon>
        <Title>Processing Your Booking</Title>
        <Message>
          We're confirming your booking request. This will only take a moment...
        </Message>
      </PendingContainer>
    );
  }
  
  return null;
};

export default BookingResponseHandler; 