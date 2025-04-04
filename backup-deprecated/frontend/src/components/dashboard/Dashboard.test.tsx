import React from 'react';
import { render, screen, waitFor } from '../../utils/test-utils';
import Dashboard from './Dashboard';
import * as apiService from '../../services/api';

// Mock all API service calls
jest.mock('../../services/api', () => ({
  getAnalyticsReport: jest.fn().mockRejectedValue(new Error('Test error')),
  getLandingPageMetrics: jest.fn().mockRejectedValue(new Error('Test error')),
  getTopTrafficSources: jest.fn().mockRejectedValue(new Error('Test error')),
  getDeviceBreakdown: jest.fn().mockRejectedValue(new Error('Test error')),
  getGeographicDistribution: jest.fn().mockRejectedValue(new Error('Test error')),
  getNewVsReturningMetrics: jest.fn().mockRejectedValue(new Error('Test error')),
  getAttributionAnalysis: jest.fn().mockRejectedValue(new Error('Test error')),
  getAnalyticsInsights: jest.fn().mockRejectedValue(new Error('Test error')),
  getOptimizationSuggestions: jest.fn().mockRejectedValue(new Error('Test error'))
}));

describe('Dashboard', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Suppress console.error for the API failure tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    jest.restoreAllMocks();
  });

  test('renders dashboard with mock data when API calls fail', async () => {
    render(<Dashboard />);
    
    // Since all API calls are mocked to fail, the component should fall back to mock data
    await waitFor(() => {
      // Check for some key elements that should be present
      expect(screen.getByText('Marketing Analytics Dashboard')).toBeInTheDocument();
      
      // Verify that metric cards are rendered
      expect(screen.getByText('Total Visits')).toBeInTheDocument();
      expect(screen.getByText('Unique Visitors')).toBeInTheDocument();
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
      expect(screen.getByText('Avg. Engagement Time')).toBeInTheDocument();
      
      // Verify that section titles are rendered
      expect(screen.getByText('Traffic Overview')).toBeInTheDocument();
      expect(screen.getByText('Conversion Analysis')).toBeInTheDocument();
      expect(screen.getByText('Traffic Distribution')).toBeInTheDocument();
    });
    
    // Verify all API services were called
    expect(apiService.getAnalyticsReport).toHaveBeenCalledTimes(1);
    expect(apiService.getLandingPageMetrics).toHaveBeenCalledTimes(1);
    expect(apiService.getTopTrafficSources).toHaveBeenCalledTimes(1);
    expect(apiService.getDeviceBreakdown).toHaveBeenCalledTimes(1);
    expect(apiService.getGeographicDistribution).toHaveBeenCalledTimes(1);
    expect(apiService.getNewVsReturningMetrics).toHaveBeenCalledTimes(1);
    expect(apiService.getAnalyticsInsights).toHaveBeenCalledTimes(1);
    expect(apiService.getOptimizationSuggestions).toHaveBeenCalledTimes(1);
  });
}); 