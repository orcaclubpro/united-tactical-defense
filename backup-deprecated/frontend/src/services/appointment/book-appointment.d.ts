/**
 * Type definitions for book-appointment.js
 */

export interface AppointmentEventData {
  source?: string;
  referrer?: string;
  keyword?: string;
  page?: {
    url: string;
    title: string;
  };
  timestamp?: number;
  domain?: string;
  [key: string]: any;
}

export interface AppointmentRequestData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  formId?: string;
  location_id?: string;
  calendar_id?: string;
  selected_slot?: string;
  selected_timezone?: string;
  sessionId?: string;
  eventData?: AppointmentEventData;
  sessionFingerprint?: string;
  funneEventData?: any;
  dateFieldDetails?: any[];
  Timezone?: string;
  paymentContactId?: any;
  timeSpent?: number;
}

export interface AppointmentResponse {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
  statusCode?: number;
  rawResponse?: any;
}

/**
 * Submit an appointment request to Go High Level
 * @param customData - Object containing form fields to override defaults
 * @returns The response from the API or a simulation
 */
export function submitAppointmentRequest(
  customData?: AppointmentRequestData
): Promise<AppointmentResponse>;

declare const bookAppointmentService: {
  submitAppointmentRequest: typeof submitAppointmentRequest;
};

export default bookAppointmentService; 