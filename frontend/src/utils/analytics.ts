/**
 * Google Analytics 4 implementation for United Tactical Defense
 * 
 * This utility provides functions for tracking events in Google Analytics 4 (GA4).
 * It focuses on tracking conversions (form submissions) and traffic sources.
 */

// Type definitions for event parameters
interface EventParams {
  [key: string]: string | number | boolean | null | undefined;
}

// Augment the window interface without changing existing type definitions
declare global {
  interface Window {
    dataLayer: any[];
    // Use the same type signature that's expected elsewhere
    // This avoids the "subsequent property declarations" error
    GA4_CONVERSION_ID: string;
  }
}

// Type guard for checking if gtag is initialized
function isGtagInitialized(): boolean {
  return typeof window.gtag !== 'undefined';
}

/**
 * Initialize Google Analytics 4
 * This function adds the GA4 tracking code to the page
 * @param measurementId - The GA4 measurement ID (format: G-XXXXXXXXXX)
 */
export const initializeGA4 = (measurementId: string): void => {
  // Don't initialize if already loaded
  if (isGtagInitialized()) return;

  // Add the GA4 script tag
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize the gtag data layer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: any[]) {
    window.dataLayer.push(arguments);
  };
  
  // Set default configuration
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
  
  console.info(`[Analytics] GA4 initialized with measurement ID: ${measurementId}`);
};

/**
 * Type-safe wrapper for gtag calls to track events
 * This gives us compile-time checking while using the runtime function
 */
function trackEvent(
  eventName: string, 
  eventParams?: {[key: string]: any}
): void {
  if (!isGtagInitialized()) return;
  window.gtag('event', eventName, eventParams);
}

/**
 * Type-safe wrapper for gtag calls to set configurations
 */
function setConfig(
  targetId: string, 
  configObject?: {[key: string]: any}
): void {
  if (!isGtagInitialized()) return;
  window.gtag('config', targetId, configObject);
}

/**
 * Type-safe wrapper for gtag calls to set properties
 */
function setProperties(
  propertyType: string, 
  properties: {[key: string]: any}
): void {
  if (!isGtagInitialized()) return;
  window.gtag('set', propertyType, properties);
}

/**
 * Track a page view
 * @param path - The page path (optional, defaults to current path)
 * @param title - The page title (optional, defaults to document title)
 */
export const trackPageView = (path?: string, title?: string): void => {
  if (!isGtagInitialized()) return;
  
  const pageTitle = title || document.title;
  const pagePath = path || window.location.pathname;
  
  trackEvent('page_view', {
    page_title: pageTitle,
    page_path: pagePath,
    page_location: window.location.href
  });
  
  console.info(`[Analytics] Page view tracked: ${pagePath}`);
};

/**
 * Track a form submission conversion
 * @param formType - The type of form (e.g., 'free_lesson', 'contact')
 * @param formData - The form data (optional)
 */
export const trackFormSubmission = (formType: string, formData?: Record<string, any>): void => {
  if (!isGtagInitialized()) return;
  
  // Base event parameters
  const eventParams: EventParams = {
    form_type: formType,
    form_id: formData?.id || `form_${Date.now()}`,
    form_source: formData?.source || 'website'
  };
  
  // For free lesson forms, track additional parameters
  if (formType === 'free_lesson' && formData) {
    eventParams.experience_level = formData.experience || 'not_specified';
    
    // Track the scheduled date if available (helps analyze popular booking times)
    if (formData.appointmentDate) {
      const date = new Date(formData.appointmentDate);
      eventParams.appointment_day = date.toLocaleDateString('en-US', { weekday: 'long' });
      eventParams.appointment_month = date.toLocaleDateString('en-US', { month: 'long' });
    }
  }
  
  // Send the conversion event
  trackEvent('generate_lead', eventParams);
  
  // Also track as a standard conversion
  trackEvent('conversion', {
    send_to: window.GA4_CONVERSION_ID, // This should be set in your environment variables
    value: formType === 'free_lesson' ? 50 : 20, // Example value based on form type
    currency: 'USD'
  });
  
  console.info(`[Analytics] Form submission tracked: ${formType}`);
};

/**
 * Track a traffic source
 * This is automatically called when the user first visits the site
 */
export const trackTrafficSource = (): void => {
  if (!isGtagInitialized()) return;
  
  // Get the traffic source information
  const referrer = document.referrer || 'direct';
  const urlParams = new URLSearchParams(window.location.search);
  
  // Extract UTM parameters
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');
  const utmContent = urlParams.get('utm_content');
  const utmTerm = urlParams.get('utm_term');
  
  // Determine the traffic source
  let trafficSource = 'direct';
  let trafficMedium = 'none';
  
  if (utmSource) {
    // If UTM parameters are present, use them as the source
    trafficSource = utmSource;
    trafficMedium = utmMedium || 'not_set';
  } else if (referrer) {
    // Extract domain from referrer
    try {
      const referrerUrl = new URL(referrer);
      const referrerDomain = referrerUrl.hostname;
      
      // Check for known sources
      if (referrerDomain.includes('google')) {
        trafficSource = 'google';
        trafficMedium = 'organic';
      } else if (referrerDomain.includes('facebook') || referrerDomain.includes('fb')) {
        trafficSource = 'facebook';
        trafficMedium = 'social';
      } else if (referrerDomain.includes('instagram')) {
        trafficSource = 'instagram';
        trafficMedium = 'social';
      } else if (referrerDomain.includes('twitter') || referrerDomain.includes('x.com')) {
        trafficSource = 'twitter';
        trafficMedium = 'social';
      } else if (referrerDomain.includes('youtube')) {
        trafficSource = 'youtube';
        trafficMedium = 'social';
      } else if (referrerDomain.includes('bing')) {
        trafficSource = 'bing';
        trafficMedium = 'organic';
      } else if (referrerDomain.includes('yahoo')) {
        trafficSource = 'yahoo';
        trafficMedium = 'organic';
      } else {
        trafficSource = referrerDomain;
        trafficMedium = 'referral';
      }
    } catch (error) {
      console.error('[Analytics] Error parsing referrer:', error);
    }
  }
  
  // Send traffic source data to GA4
  setProperties('user_properties', {
    traffic_source: trafficSource,
    traffic_medium: trafficMedium,
    utm_campaign: utmCampaign || null,
    utm_content: utmContent || null,
    utm_term: utmTerm || null,
    first_visit_page: window.location.pathname
  });
  
  // Store the traffic source in localStorage for session tracking
  try {
    localStorage.setItem('traffic_source', trafficSource);
    localStorage.setItem('traffic_medium', trafficMedium);
    if (utmCampaign) localStorage.setItem('utm_campaign', utmCampaign);
    if (utmContent) localStorage.setItem('utm_content', utmContent);
    if (utmTerm) localStorage.setItem('utm_term', utmTerm);
  } catch (error) {
    console.error('[Analytics] Error storing traffic source in localStorage:', error);
  }
  
  console.info(`[Analytics] Traffic source tracked: ${trafficSource} / ${trafficMedium}`);
};

/**
 * Get the stored traffic source information
 * @returns The traffic source data
 */
export const getTrafficSource = () => {
  try {
    return {
      source: localStorage.getItem('traffic_source') || 'direct',
      medium: localStorage.getItem('traffic_medium') || 'none',
      campaign: localStorage.getItem('utm_campaign') || null,
      content: localStorage.getItem('utm_content') || null,
      term: localStorage.getItem('utm_term') || null
    };
  } catch (error) {
    console.error('[Analytics] Error retrieving traffic source from localStorage:', error);
    return {
      source: 'direct',
      medium: 'none',
      campaign: null,
      content: null,
      term: null
    };
  }
};
