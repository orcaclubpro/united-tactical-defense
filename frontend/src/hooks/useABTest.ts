import { useState, useEffect } from 'react';
import { ABTestingService } from '../services/analytics';
import { ABTestVariant } from '../services/analytics/abTesting';

/**
 * Custom hook to access A/B test variants in components.
 * 
 * @param testId - The ID of the A/B test to use
 * @returns The assigned variant, loading state, and tracking function
 */
export function useABTest(testId: string) {
  const [variant, setVariant] = useState<ABTestVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get the assigned variant for this test
    const assignedVariant = ABTestingService.getAssignedVariant(testId);
    setVariant(assignedVariant);
    setIsLoading(false);
  }, [testId]);

  /**
   * Track a conversion or interaction event for this A/B test
   * 
   * @param eventType - Type of event to track (e.g., 'click', 'submit', etc.)
   * @param metadata - Additional data to include with the event
   */
  const trackEvent = (eventType: string, metadata?: Record<string, any>) => {
    if (variant) {
      ABTestingService.trackConversion(testId, eventType, metadata);
    }
  };

  return {
    variant,
    isVariant: (variantId: string) => variant?.id === variantId,
    isLoading,
    trackEvent
  };
}

export default useABTest; 