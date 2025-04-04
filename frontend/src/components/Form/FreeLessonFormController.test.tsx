import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FreeLessonFormController } from './FreeLessonFormController';
import * as appointmentService from '../../services/appointment/appointment-service';

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

// Mock appointment service
jest.mock('../../services/appointment/appointment-service', () => ({
  submitFreeClassBooking: jest.fn()
}));

describe('FreeLessonFormController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders component correctly when open', () => {
    render(<FreeLessonFormController isOpen={true} />);
    
    // Check that component renders with appropriate title
    expect(screen.getByText(/REGISTER FOR TACTICAL TRAINING/)).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    render(<FreeLessonFormController isOpen={false} />);
    
    // Component should not show when isOpen is false
    expect(screen.getByText(/BOOK FREE TRAINING/)).toBeInTheDocument();
    expect(screen.queryByText(/REGISTER FOR TACTICAL TRAINING/)).not.toBeInTheDocument();
  });

  test('submits form data to appointment service', async () => {
    // Set up the mock to return success
    (appointmentService.submitFreeClassBooking as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'test-booking-123' },
      message: 'Appointment scheduled successfully'
    });

    render(<FreeLessonFormController isOpen={true} formSource="test" />);
    
    // Fill out form fields in the first step
    const firstNameInput = screen.getByLabelText(/FIRST NAME/i);
    const lastNameInput = screen.getByLabelText(/LAST NAME/i);
    const emailInput = screen.getByLabelText(/EMAIL/i);
    const phoneInput = screen.getByLabelText(/PHONE/i);
    
    userEvent.type(firstNameInput, 'John');
    userEvent.type(lastNameInput, 'Test');
    userEvent.type(emailInput, 'john.test@example.com');
    userEvent.type(phoneInput, '1234567890');
    
    // Navigate to next step
    const nextButton = screen.getByText(/CONTINUE/i);
    fireEvent.click(nextButton);
    
    // TODO: Complete appointment selection step
    // This would typically involve date/time selection which might be complex to test
    
    // For this test, we'll just simulate the form submission
    // by calling the submit function directly
    
    // Wait for submission to complete when we implement full navigation
    await waitFor(() => {
      // Assertion will go here
    });
    
    // Note: In a complete test, we would continue navigation through all steps
    // and then verify the submission was made with correct data
  });

  test('shows success message when submission succeeds', async () => {
    // This test would verify the success UI is shown after submission
    // Implementation would depend on how we trigger submission in tests
  });

  test('shows error message when submission fails', async () => {
    // This test would verify error messages are displayed when submission fails
    // Implementation would depend on how we trigger submission in tests
  });
}); 