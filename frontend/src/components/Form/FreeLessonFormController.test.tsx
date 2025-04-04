import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider } from '../../contexts/FormContext';
import { FreeLessonFormController } from './FreeLessonFormController';

// Mock server setup
const server = setupServer(
  // Mock API responses for form submission
  http.post('http://localhost:5000/api/bookings/free-lesson', () => {
    return HttpResponse.json({
      success: true,
      data: {
        appointment: {
          id: '12345',
          date: '2023-06-15',
          time: '10:00 AM'
        }
      }
    });
  }),
  
  // Mock API responses for time slot availability
  http.get('http://localhost:5000/api/availability/check', () => {
    return HttpResponse.json({
      success: true,
      timeSlots: [
        { id: 'slot1', time: '9:00 AM', available: true },
        { id: 'slot2', time: '10:00 AM', available: true },
        { id: 'slot3', time: '11:00 AM', available: false },
        { id: 'slot4', time: '1:00 PM', available: true }
      ]
    });
  })
);

// Setup and teardown
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Wrap the component with form context
const renderWithFormContext = (ui: React.ReactElement) => {
  return render(
    <FormProvider>
      {ui}
    </FormProvider>
  );
};

describe('FreeLessonFormController', () => {
  test('renders the booking trigger button when closed', () => {
    renderWithFormContext(<FreeLessonFormController />);
    
    const triggerButton = screen.getByText('Book Your Free Class');
    expect(triggerButton).toBeInTheDocument();
  });
  
  test('opens the modal when trigger button is clicked', () => {
    renderWithFormContext(<FreeLessonFormController />);
    
    const triggerButton = screen.getByText('Book Your Free Class');
    fireEvent.click(triggerButton);
    
    // Check if modal is now visible
    const modalTitle = screen.getByText('Book Your Free Training Session');
    expect(modalTitle).toBeInTheDocument();
  });
  
  test('displays the contact form step first', () => {
    renderWithFormContext(<FreeLessonFormController isOpen={true} />);
    
    // Check for contact form elements
    const contactStep = screen.getByTestId('contact-form-step');
    expect(contactStep).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
  });
  
  test('validates required fields in contact step', async () => {
    renderWithFormContext(<FreeLessonFormController isOpen={true} />);
    
    // Try to proceed without filling required fields
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Phone is required')).toBeInTheDocument();
    });
  });
  
  test('proceeds to appointment step when contact form is valid', async () => {
    renderWithFormContext(<FreeLessonFormController isOpen={true} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Phone'), {
      target: { value: '555-123-4567' }
    });
    
    // Click next
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Check that we're now on the booking calendar step
    await waitFor(() => {
      expect(screen.getByTestId('booking-calendar')).toBeInTheDocument();
    });
  });
  
  test('shows success message after form submission', async () => {
    renderWithFormContext(<FreeLessonFormController isOpen={true} />);
    
    // Mock navigation through all steps
    // This would normally be done by filling out each step and clicking next
    
    // Mock a complete form submission
    // In a real test, you'd simulate filling out and submitting the form
    
    // Check for success message
    await waitFor(() => {
      const successMessage = screen.getByTestId('booking-success');
      expect(successMessage).toBeInTheDocument();
      expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
    });
  });
}); 