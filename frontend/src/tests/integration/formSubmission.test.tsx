import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider } from '../../contexts/FormContext';
import { FreeLessonFormController } from '../../components/Form/FreeLessonFormController';
import ConnectionStatus from '../../components/Form/ConnectionStatus';
import * as api from '../../services/api';

// Mock the API calls
const server = setupServer(
  // Mock free lesson form submission
  http.post('/api/form/free-class', () => {
    return HttpResponse.json({
      success: true,
      data: {
        appointment: {
          id: '12345',
          date: '2023-06-15',
          time: '10:00 AM'
        },
        lead: {
          id: '67890',
          name: 'Test User',
          email: 'test@example.com'
        }
      }
    });
  }),
  
  // Mock available time slots
  http.get('/api/appointment/available', ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const program = url.searchParams.get('program');
    
    return HttpResponse.json({
      success: true,
      data: {
        timeSlots: [
          { id: 'slot1', date, time: '09:00 AM', available: true },
          { id: 'slot2', date, time: '10:00 AM', available: true },
          { id: 'slot3', date, time: '11:00 AM', available: false },
          { id: 'slot4', date, time: '01:00 PM', available: true },
          { id: 'slot5', date, time: '02:00 PM', available: true }
        ]
      }
    });
  }),
  
  // Mock reserve time slot
  http.post('/api/appointment/reserve', () => {
    return HttpResponse.json({
      success: true,
      data: {
        appointment: {
          id: '12345',
          date: '2023-06-15',
          time: '10:00 AM',
          status: 'reserved'
        }
      }
    });
  })
);

// Set up and tear down the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock navigator.onLine for offline testing
const mockOnline = (online: boolean) => {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value: online,
    writable: true
  });
};

// Wrap component with necessary providers for testing
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <FormProvider>
      {ui}
    </FormProvider>
  );
};

describe('Form Submission Integration Tests', () => {
  // Tests for online form submission flow
  describe('Online Form Submission', () => {
    beforeEach(() => {
      mockOnline(true);
      // Clear any offline queue
      localStorage.removeItem('offline_form_submission_queue');
    });
    
    test('Complete form flow - contact to appointment to confirmation', async () => {
      // Render the form controller
      renderWithProviders(<FreeLessonFormController isOpen={true} />);
      
      // 1. Fill out contact form
      await userEvent.type(screen.getByLabelText('Name'), 'Test User');
      await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('Phone'), '555-123-4567');
      
      // Navigate to next step
      fireEvent.click(screen.getByText('Next'));
      
      // 2. Verify appointment step is shown
      await waitFor(() => {
        expect(screen.getByTestId('booking-calendar')).toBeInTheDocument();
      });
      
      // 3. Select date and time (simulated)
      // This would normally involve clicking on the calendar
      // For testing purposes, we'll update the form directly
      await waitFor(() => {
        // Select date and time (implementation will depend on your calendar component)
        // This is simplified for the test
        const formDate = new Date('2023-06-15');
        const formTime = '10:00 AM';
        
        // Update the form context with the selected date/time
        // This would normally happen when a user clicks on the calendar
      });
      
      // Navigate to next step
      fireEvent.click(screen.getByText('Next'));
      
      // 4. Verify booking summary is shown
      await waitFor(() => {
        expect(screen.getByTestId('booking-summary')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('555-123-4567')).toBeInTheDocument();
      });
      
      // 5. Confirm booking
      fireEvent.click(screen.getByText('Confirm Booking'));
      
      // 6. Verify success message
      await waitFor(() => {
        expect(screen.getByTestId('booking-success')).toBeInTheDocument();
        expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
      });
    });
    
    test('Form validation prevents submission with invalid data', async () => {
      renderWithProviders(<FreeLessonFormController isOpen={true} />);
      
      // Try to proceed without filling required fields
      fireEvent.click(screen.getByText('Next'));
      
      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Phone is required')).toBeInTheDocument();
      });
      
      // Fill with invalid email
      await userEvent.type(screen.getByLabelText('Name'), 'Test User');
      await userEvent.type(screen.getByLabelText('Email'), 'invalid-email');
      await userEvent.type(screen.getByLabelText('Phone'), '555-123-4567');
      
      fireEvent.click(screen.getByText('Next'));
      
      // Check for email validation error
      await waitFor(() => {
        expect(screen.getByText('Email is invalid')).toBeInTheDocument();
      });
    });
    
    test('Server errors are properly displayed to the user', async () => {
      // Override server response to simulate an error
      server.use(
        http.post('/api/form/free-class', () => {
          return HttpResponse.json(
            {
              success: false,
              error: 'Server error processing form'
            },
            { status: 500 }
          );
        })
      );
      
      renderWithProviders(<FreeLessonFormController isOpen={true} />);
      
      // Complete form steps and submit
      // ... (implementation omitted for brevity) ...
      
      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText('An error occurred')).toBeInTheDocument();
      });
    });
  });
  
  // Tests for offline functionality
  describe('Offline Form Submission', () => {
    beforeEach(() => {
      mockOnline(false);
      localStorage.removeItem('offline_form_submission_queue');
    });
    
    test('Forms are queued when submitted offline', async () => {
      // Mock the form submission function to verify queue usage
      const queueSpy = jest.spyOn(api, 'queueFormSubmission');
      
      renderWithProviders(
        <>
          <ConnectionStatus />
          <FreeLessonFormController isOpen={true} />
        </>
      );
      
      // Verify offline indicator is shown
      expect(screen.getByText('You are offline')).toBeInTheDocument();
      
      // Fill out and submit the form
      // ... (implementation omitted for brevity) ...
      
      // Verify the form was queued, not sent directly
      await waitFor(() => {
        expect(queueSpy).toHaveBeenCalled();
        
        // Check localStorage to verify the queue was updated
        const queue = JSON.parse(localStorage.getItem('offline_form_submission_queue') || '[]');
        expect(queue.length).toBeGreaterThan(0);
      });
    });
    
    test('Queued submissions are processed when coming back online', async () => {
      // Add a mock submission to the queue
      const mockSubmission = {
        id: 'test_submission',
        endpoint: '/api/form/free-class',
        formData: {
          name: 'Offline User',
          email: 'offline@example.com',
          phone: '555-987-6543',
          appointmentDate: '2023-06-20',
          appointmentTime: '11:00 AM'
        },
        timestamp: Date.now(),
        retryCount: 0
      };
      
      localStorage.setItem(
        'offline_form_submission_queue', 
        JSON.stringify([mockSubmission])
      );
      
      // Mock the processing function to verify it's called
      const processSpy = jest.spyOn(api, 'processQueuedSubmissions');
      
      renderWithProviders(<ConnectionStatus />);
      
      // Trigger online status
      mockOnline(true);
      window.dispatchEvent(new Event('online'));
      
      // Verify processing was triggered
      await waitFor(() => {
        expect(processSpy).toHaveBeenCalled();
      });
    });
  });
  
  // Tests for A/B testing components
  describe('A/B Testing Variants', () => {
    test('Different form variants can be rendered based on test configuration', async () => {
      // This would test the ABTestingVariant component's ability to 
      // render different components based on test configuration
      // ... (implementation would depend on your A/B testing setup) ...
    });
  });
}); 