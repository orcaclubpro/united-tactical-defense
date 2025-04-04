/**
 * GoHighLevelAdapter.ts
 * Adapter for GoHighLevel API integration
 */

import { GO_HIGH_LEVEL_CONFIG } from '../../../config/api-config';

interface GoHighLevelAppointmentData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  formId: string;
  location_id: string;
  calendar_id: string;
  selected_slot: string;
  selected_timezone: string;
  sessionId: string;
  eventData?: any;
  sessionFingerprint?: string;
  funneEventData?: any;
  dateFieldDetails?: any[];
  Timezone?: string;
  paymentContactId?: any;
  timeSpent?: number;
  [key: string]: any;
}

/**
 * Adapts form data to the GoHighLevel appointment booking format
 */
export const adaptToGoHighLevel = (formData: any): GoHighLevelAppointmentData => {
  // Generate a session ID if not provided
  const sessionId = formData.sessionId || `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  
  return {
    // Required fields
    first_name: formData.firstName || formData.first_name || '',
    last_name: formData.lastName || formData.last_name || '',
    phone: formData.phone || '',
    email: formData.email || '',
    
    // Configuration
    formId: GO_HIGH_LEVEL_CONFIG.FORM_ID,
    location_id: GO_HIGH_LEVEL_CONFIG.LOCATION_ID,
    calendar_id: GO_HIGH_LEVEL_CONFIG.CALENDAR_ID,
    
    // Appointment details
    selected_slot: formData.selected_slot || 
      (formData.date && formData.time ? `${formData.date}T${formData.time}` : ''),
    selected_timezone: formData.timezone || GO_HIGH_LEVEL_CONFIG.DEFAULT_TIMEZONE,
    
    // Session tracking
    sessionId,
    sessionFingerprint: formData.sessionFingerprint || `${Date.now()}-${Math.random().toString(36).substring(2)}`,
    
    // Additional data
    eventData: formData.eventData || {
      source: "direct",
      referrer: window.document.referrer || "",
      keyword: "",
      page: {
        url: window.location.href,
        title: document.title
      },
      timestamp: Date.now(),
      type: "page-visit",
      domain: window.location.hostname,
      version: "v3",
      medium: "calendar",
      mediumId: GO_HIGH_LEVEL_CONFIG.CALENDAR_ID
    },
    
    // Optional fields that might be needed
    Timezone: `${formData.timezone || GO_HIGH_LEVEL_CONFIG.DEFAULT_TIMEZONE} (GMT-07:00)`,
    timeSpent: formData.timeSpent || Math.floor(Math.random() * 100) + 60
  };
};

/**
 * Creates a multipart form body for GoHighLevel submissions
 */
export const createGoHighLevelMultipartBody = (appointmentData: GoHighLevelAppointmentData): {body: string, boundary: string} => {
  // Define the boundary for multipart form data
  const boundary = '----geckoformboundary' + Math.random().toString(16).substring(2);
  
  // Create multipart form body
  let body = '';
  
  // Add formData part
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="formData"\r\n\r\n';
  body += JSON.stringify(appointmentData) + '\r\n';
  
  // Add locationId part
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="locationId"\r\n\r\n';
  body += GO_HIGH_LEVEL_CONFIG.LOCATION_ID + '\r\n';
  
  // Add formId part
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="formId"\r\n\r\n';
  body += GO_HIGH_LEVEL_CONFIG.FORM_ID + '\r\n';
  
  // Close the body
  body += `--${boundary}--\r\n`;
  
  return { body, boundary };
};

export default {
  adaptToGoHighLevel,
  createGoHighLevelMultipartBody
}; 