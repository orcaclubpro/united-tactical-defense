/**
 * Appointment Service
 * 
 * A service to handle the integration between form components and the appointment booking system.
 * This service standardizes the interface and adds logging and error handling.
 */

import { submitAppointmentRequest, AppointmentRequestData } from './book-appointment';

export interface FreeClassFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  appointmentDate: Date | null;
  appointmentTime: string;
  experience?: string;
  formSource?: string;
  [key: string]: any;
}

export interface SubmitRequestResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  statusCode?: number;
  rawResponse?: any;
}

/**
 * Submit a free class booking request
 * 
 * @param formData - The form data from the FreeLessonFormController
 * @returns A standardized response with success/failure information
 */
export async function submitFreeClassBooking(formData: FreeClassFormData): Promise<SubmitRequestResult> {
  console.group('📝 Appointment Service: submitFreeClassBooking');
  console.log('Incoming form data:', formData);
  console.groupEnd();
  
  try {
    // Format the form data for the appointment booking system
    const requestData: AppointmentRequestData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      // Format date and time for the API
      selected_slot: formData.appointmentDate 
        ? `${formData.appointmentDate.toISOString().split('T')[0]}T${formData.appointmentTime}:00-07:00` 
        : undefined,
      selected_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    // Add tracking information if available
    if (formData.formSource) {
      requestData.eventData = {
        ...requestData.eventData,
        source: formData.formSource,
        medium: "website",
        campaign: formData.formSource
      };
    }
    
    console.group('📤 Appointment Service: Formatted Request');
    console.log('Sending to booking service:', requestData);
    console.groupEnd();
    
    // Submit the request to the booking service
    const response = await submitAppointmentRequest(requestData);
    
    console.group(response.success ? '✅ Booking Service Response (Success)' : '❌ Booking Service Response (Error)');
    console.log('Response:', response);
    console.groupEnd();
    
    // Return a standardized result that includes all response data
    return {
      success: response.success,
      message: response.message,
      data: response.data,
      error: response.error,
      statusCode: response.statusCode,
      rawResponse: response.rawResponse || response
    };
  } catch (error: unknown) {
    // Handle any unexpected errors
    console.group('💥 Appointment Service Exception');
    console.error('Error:', error);
    console.groupEnd();
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      rawResponse: error
    };
  }
}

const appointmentService = {
  submitFreeClassBooking
};

export default appointmentService; 