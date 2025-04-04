/**
 * Mock utilities for frontend development
 * 
 * This file provides helper functions to determine when the application
 * is running with mock backend implementations and to provide appropriate
 * behavior based on that state.
 */

/**
 * Determines if the application is running in mock mode
 * This checks for the REACT_APP_USING_MOCK_API environment variable
 */
export const isMockMode = (): boolean => {
  return process.env.REACT_APP_USING_MOCK_API === 'true';
};

/**
 * Logs mock API operation information when in development
 * @param operation The name of the API operation being simulated
 * @param data Optional data being returned 
 */
export const logMockOperation = (operation: string, data?: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`%c[MOCK API] ${operation}`, 'color: #8e44ad; font-weight: bold');
    if (data) {
      console.info(data);
    }
  }
};

/**
 * Simulates a network delay for mock API responses
 * Only adds delay in development mode to simulate real API calls
 * @param minMs Minimum delay in milliseconds (default: 200)
 * @param maxMs Maximum delay in milliseconds (default: 600)
 */
export const simulateNetworkDelay = async (minMs = 200, maxMs = 600): Promise<void> => {
  if (process.env.NODE_ENV === 'development') {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
};

/**
 * Returns mock error response based on error type
 * @param errorType The type of error to simulate
 */
export const getMockErrorResponse = (errorType: 'network' | 'authentication' | 'permission' | 'notFound' | 'server') => {
  const errors = {
    network: { message: 'Network error: Could not connect to server', status: 0 },
    authentication: { message: 'Authentication required', status: 401 },
    permission: { message: 'Permission denied', status: 403 },
    notFound: { message: 'Resource not found', status: 404 },
    server: { message: 'Internal server error', status: 500 }
  };
  
  return errors[errorType];
};

/**
 * Generate a mock ID for use in mock data
 * @param prefix Optional prefix for the ID
 */
export const generateMockId = (prefix = ''): string => {
  return `${prefix}${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Create a data response wrapper like what would come from axios
 * @param data The data to wrap in a response object
 */
export const createMockResponse = <T>(data: T) => {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {
      'content-type': 'application/json'
    },
    config: {}
  };
}; 