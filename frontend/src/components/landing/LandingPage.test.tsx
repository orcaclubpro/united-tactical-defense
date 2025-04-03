import React from 'react';
import { render, screen, waitFor } from '../../utils/test-utils';
import LandingPage from './LandingPage';
import { trackPageVisit } from '../../services/api';

// Mock the API service
jest.mock('../../services/api', () => ({
  trackPageVisit: jest.fn().mockResolvedValue({}),
}));

describe('LandingPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders all main sections', async () => {
    render(<LandingPage />);
    
    // Wait for useEffect to complete
    await waitFor(() => {
      expect(trackPageVisit).toHaveBeenCalled();
    });
    
    // Check that all major components are rendered
    // These assertions will need to be adjusted based on what text or elements
    // are actually present in each component
    
    // The test could look for specific headings, text, or data-testid attributes
    // For now, we'll just verify the component doesn't crash when rendering
    expect(document.querySelector('.landing-page')).toBeInTheDocument();
  });

  test('tracks page visit on load', async () => {
    render(<LandingPage />);
    
    // Verify the tracking function was called with expected data
    await waitFor(() => {
      expect(trackPageVisit).toHaveBeenCalledTimes(1);
      // Use the typecasted mock to access call arguments safely
      const mockedTrackPageVisit = trackPageVisit as jest.Mock;
      const callData = mockedTrackPageVisit.mock.calls[0][0];
      expect(callData.page).toBe(window.location.pathname);
      expect(callData.is_landing_page).toBe(1);
    });
  });
}); 