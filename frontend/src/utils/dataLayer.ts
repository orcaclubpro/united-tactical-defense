/**
 * DataLayer utility for Google Tag Manager
 * 
 * This file provides functions for interacting with the Google Tag Manager dataLayer.
 * It allows pushing events and variables to the dataLayer in a consistent format.
 */

// Ensure dataLayer exists
declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Initialize dataLayer if it doesn't exist
export const initializeDataLayer = (): void => {
  window.dataLayer = window.dataLayer || [];
  console.info('[GTM] DataLayer initialized');
};

/**
 * Push an event to the dataLayer
 * @param eventName - The name of the event
 * @param eventData - Additional data for the event
 */
export const pushEvent = (eventName: string, eventData: Record<string, any> = {}): void => {
  if (!window.dataLayer) {
    initializeDataLayer();
  }

  // Create the data object
  const dataObject = {
    event: eventName,
    ...eventData
  };

  // Push to dataLayer
  window.dataLayer.push(dataObject);
  
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[GTM] Event pushed: ${eventName}`, dataObject);
  }
};

/**
 * Push form submission event
 * 
 * @param formId - ID of the form being submitted
 * @param formData - Data from the form
 */
export const pushFormSubmission = (formId: string, formData: Record<string, any> = {}): void => {
  pushEvent('form_submission', {
    form_id: formId,
    ...formData
  });
};

/**
 * Push form step event (for multi-step forms)
 * 
 * @param formId - ID of the form
 * @param stepNumber - Current step number
 * @param stepName - Name of the current step
 */
export const pushFormStep = (formId: string, stepNumber: number, stepName: string): void => {
  pushEvent('form_step', {
    form_id: formId,
    step_number: stepNumber,
    step_name: stepName
  });
};

/**
 * Push appointment booking event
 * 
 * @param appointmentData - Data about the appointment
 */
export const pushAppointmentBooked = (appointmentData: Record<string, any>): void => {
  pushEvent('appointment_booked', appointmentData);
};

/**
 * Set user data in dataLayer
 * 
 * @param userData - Data about the user
 */
export const setUserData = (userData: Record<string, any>): void => {
  pushEvent('set_user_data', {
    user_data: userData
  });
};

/**
 * Track button click
 * 
 * @param buttonId - ID or name of the button
 * @param buttonText - Text of the button
 * @param location - Location of the button on the page
 */
export const trackButtonClick = (buttonId: string, buttonText: string, location: string): void => {
  pushEvent('button_click', {
    button_id: buttonId,
    button_text: buttonText,
    button_location: location
  });
};

/**
 * Enhanced ecommerce: Track a conversion
 * 
 * @param conversionData - Data about the conversion
 */
export const trackConversion = (conversionData: Record<string, any>): void => {
  pushEvent('conversion', conversionData);
};

export default {
  pushEvent,
  pushFormSubmission,
  pushFormStep,
  pushAppointmentBooked,
  setUserData,
  trackButtonClick,
  trackConversion
};
