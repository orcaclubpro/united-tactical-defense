/**
 * Rumble Analytics Service
 * 
 * This service provides functions for tracking events and conversions with Rumble Analytics.
 * It integrates with the Rumble tracking script loaded in the HTML template.
 */

// Extend the window interface to include Rumble analytics functions
declare global {
  interface Window {
    _ratagData: any[];
    ratag: (...args: any[]) => void;
    ratag_conversion: (url?: string) => boolean;
  }
}

/**
 * Type guard to check if Rumble analytics is initialized
 */
function isRumbleInitialized(): boolean {
  return typeof window.ratag !== 'undefined' && typeof window._ratagData !== 'undefined';
}

/**
 * Type guard to check if Rumble conversion function is available
 */
function isRumbleConversionAvailable(): boolean {
  return typeof window.ratag_conversion !== 'undefined';
}

/**
 * Initialize Rumble analytics if not already loaded
 * This function is called automatically when the service is imported
 */
export const initializeRumble = (): void => {
  if (isRumbleInitialized()) {
    console.info('[Rumble Analytics] Already initialized');
    return;
  }

  // Initialize the data layer if it doesn't exist
  window._ratagData = window._ratagData || [];
  
  // Create the ratag function if it doesn't exist
  if (typeof window.ratag === 'undefined') {
    window.ratag = function(...args: any[]) {
      window._ratagData.push(arguments);
    };
  }

  console.info('[Rumble Analytics] Initialized');
};

/**
 * Track a page view with Rumble Analytics
 * @param pageUrl - Optional page URL (defaults to current page)
 */
export const trackRumblePageView = (pageUrl?: string): void => {
  if (!isRumbleInitialized()) {
    console.warn('[Rumble Analytics] Not initialized, cannot track page view');
    return;
  }

  const url = pageUrl || window.location.href;
  
  try {
    window.ratag('page_view', { url });
    console.info(`[Rumble Analytics] Page view tracked: ${url}`);
  } catch (error) {
    console.error('[Rumble Analytics] Error tracking page view:', error);
  }
};

/**
 * Track a conversion with Rumble Analytics
 * This function uses the predefined conversion setup with ID 2829
 * @param redirectUrl - Optional URL to redirect to after conversion tracking
 */
export const trackRumbleConversion = (redirectUrl?: string): void => {
  if (!isRumbleConversionAvailable()) {
    console.warn('[Rumble Analytics] Conversion tracking not available');
    return;
  }

  try {
    // Call the global conversion function
    window.ratag_conversion(redirectUrl);
    console.info('[Rumble Analytics] Conversion tracked with ID 2829');
  } catch (error) {
    console.error('[Rumble Analytics] Error tracking conversion:', error);
  }
};

/**
 * Track a custom event with Rumble Analytics
 * @param eventName - The name of the event to track
 * @param eventData - Optional event data
 */
export const trackRumbleEvent = (eventName: string, eventData?: Record<string, any>): void => {
  if (!isRumbleInitialized()) {
    console.warn('[Rumble Analytics] Not initialized, cannot track event');
    return;
  }

  try {
    window.ratag(eventName, eventData);
    console.info(`[Rumble Analytics] Event tracked: ${eventName}`);
  } catch (error) {
    console.error('[Rumble Analytics] Error tracking event:', error);
  }
};

/**
 * Track a form submission with Rumble Analytics
 * @param formType - The type of form (e.g., 'booking', 'contact')
 * @param formData - Optional form data
 */
export const trackRumbleFormSubmission = (formType: string, formData?: Record<string, any>): void => {
  if (!isRumbleInitialized()) {
    console.warn('[Rumble Analytics] Not initialized, cannot track form submission');
    return;
  }

  try {
    const eventData = {
      form_type: formType,
      form_source: formData?.source || 'website',
      ...formData
    };

    window.ratag('form_submit', eventData);
    console.info(`[Rumble Analytics] Form submission tracked: ${formType}`);
  } catch (error) {
    console.error('[Rumble Analytics] Error tracking form submission:', error);
  }
};

/**
 * Track an appointment booking conversion
 * This is a specialized function for booking conversions that includes conversion tracking
 * @param bookingData - The booking data
 */
export const trackRumbleBookingConversion = (bookingData?: Record<string, any>): void => {
  // First track the form submission event
  trackRumbleFormSubmission('appointment_booking', bookingData);
  
  // Then track the conversion
  trackRumbleConversion();
  
  console.info('[Rumble Analytics] Booking conversion tracked');
};

// Initialize Rumble analytics when this module is imported
initializeRumble();

export default {
  initializeRumble,
  trackRumblePageView,
  trackRumbleConversion,
  trackRumbleEvent,
  trackRumbleFormSubmission,
  trackRumbleBookingConversion
};