import { useEffect, useCallback } from 'react';
import { 
  trackPageView, 
  trackFormSubmission, 
  trackTrafficSource, 
  getTrafficSource 
} from './analytics';

/**
 * Custom hook for using Google Analytics 4 tracking
 * 
 * This hook provides easy access to common analytics tracking functions
 * and automatically tracks page views when the path changes.
 * 
 * @param path - Current path or route
 * @returns Object with tracking functions
 */
const useAnalytics = (path?: string) => {
  // Track page view when path changes
  useEffect(() => {
    if (path && process.env.NODE_ENV === 'production') {
      trackPageView(path);
    }
  }, [path]);

  // Track traffic source on initial mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      trackTrafficSource();
    }
  }, []);

  // Memoized tracking functions to avoid recreating them on each render
  const trackForm = useCallback((formType: string, formData?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'production') {
      trackFormSubmission(formType, formData);
    }
  }, []);

  const getTraffic = useCallback(() => {
    return getTrafficSource();
  }, []);

  return {
    trackPageView,
    trackForm,
    getTrafficSource: getTraffic
  };
};

export default useAnalytics;
