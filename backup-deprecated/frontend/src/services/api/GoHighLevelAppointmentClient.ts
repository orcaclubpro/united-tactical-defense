/**
 * GoHighLevelAppointmentClient.ts
 * Specialized client for interfacing with the Go High Level appointment system
 */

import { adaptToGoHighLevel } from './adapters/GoHighLevelAdapter';
import { GO_HIGH_LEVEL_CONFIG, STORAGE_KEYS, RETRY_CONFIG } from '../../config/api-config';
import { submitAppointmentRequest } from '../../services/appointment/book-appointment';

// Define response types
export interface AppointmentResponse {
  success: boolean;
  data?: {
    appointmentId?: string;
    confirmedTime?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  };
  message?: string;
  error?: string;
  statusCode?: number;
  rawResponse?: any; // Store the raw server response
}

/**
 * Client for submitting appointments to the Go High Level system
 */
class GoHighLevelAppointmentClient {
  private apiEndpoint: string = GO_HIGH_LEVEL_CONFIG.APPOINTMENT_ENDPOINT;
  private formSubmissionEndpoint: string = GO_HIGH_LEVEL_CONFIG.FORM_SUBMISSION_ENDPOINT;
  private debugMode: boolean = true;

  /**
   * Enhanced logging with proper formatting
   */
  private log(title: string, data: any, isError: boolean = false): void {
    if (!this.debugMode) return;
    
    const styles = {
      title: 'color: #2196F3; font-weight: bold; font-size: 12px;',
      success: 'color: #4CAF50;',
      error: 'color: #F44336;',
      info: 'color: #9E9E9E;'
    };
    
    console.group(`%c🔄 ${title}`, styles.title);
    
    if (isError) {
      console.error(data);
    } else if (typeof data === 'object') {
      console.log(data);
    } else {
      console.log(`%c${data}`, styles.info);
    }
    
    console.groupEnd();
  }

  /**
   * Submit an appointment request to Go High Level
   */
  async submitAppointmentRequest(formData: any): Promise<AppointmentResponse> {
    try {
      this.log('Submitting Appointment Request', {
        timestamp: new Date().toISOString(),
        formData
      });
      
      // Transform form data to Go High Level format
      const appointmentData = adaptToGoHighLevel(formData);
      
      // Use the enhanced submitAppointmentRequest from book-appointment.js
      const response = await submitAppointmentRequest(appointmentData);
      
      // Log complete server response for debugging
      this.log(
        response.success ? 'Server Response (Success)' : 'Server Response (Error)', 
        {
          statusCode: response.statusCode,
          message: response.message,
          error: response.error,
          data: response.data,
          success: response.success,
          rawResponse: response.rawResponse || response
        },
        !response.success
      );
      
      // If there was an error, return the error response with user-friendly message
      if (!response.success) {
        return {
          success: false,
          message: response.message || 'Failed to submit appointment request',
          error: response.error || 'Unknown error occurred',
          statusCode: response.statusCode,
          rawResponse: response
        };
      }
      
      // Return the successful response
      return {
        success: true,
        message: response.message || 'Appointment scheduled successfully',
        data: {
          appointmentId: response.data?.id || response.data?.appointmentId,
          confirmedTime: appointmentData.selected_slot,
          firstName: appointmentData.first_name,
          lastName: appointmentData.last_name,
          email: appointmentData.email,
          phone: appointmentData.phone,
          ...response.data
        },
        rawResponse: response
      };
    } catch (error: any) {
      // Log error details
      this.log('Error in submitAppointmentRequest', {
        error: error,
        message: error.message,
        stack: error.stack,
        formData
      }, true);
      
      return {
        success: false,
        message: error.message || 'Failed to submit appointment request',
        error: error.message || 'An unexpected error occurred',
        rawResponse: error
      };
    }
  }
  
  /**
   * Submit an appointment with offline support
   * If offline, the request will be queued for later submission
   */
  async submitWithOfflineSupport(formData: any): Promise<AppointmentResponse> {
    // Check if online
    if (navigator.onLine) {
      return this.submitAppointmentRequest(formData);
    } else {
      // Queue for later submission
      const appointmentData = adaptToGoHighLevel(formData);
      const queueId = this.queueAppointmentRequest(appointmentData);
      
      this.log('Queued Offline Request', {
        queueId,
        appointmentData
      });
      
      return {
        success: true,
        message: 'Your appointment request has been saved and will be submitted when you are back online.',
        data: {
          appointmentId: queueId,
          confirmedTime: appointmentData.selected_slot,
          firstName: appointmentData.first_name,
          lastName: appointmentData.last_name,
          queued: true
        }
      };
    }
  }
  
  /**
   * Queue an appointment request for later submission
   */
  private queueAppointmentRequest(appointmentData: any): string {
    const QUEUE_STORAGE_KEY = STORAGE_KEYS.APPOINTMENT_QUEUE;
    
    // Get existing queue
    const queueString = localStorage.getItem(QUEUE_STORAGE_KEY);
    const queue = queueString ? JSON.parse(queueString) : [];
    
    // Generate submission ID
    const submissionId = `appointment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Add to queue
    queue.push({
      id: submissionId,
      data: appointmentData,
      timestamp: Date.now(),
      attempts: 0
    });
    
    // Save updated queue
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    
    // Setup listener for online events if not already set
    if (!window._offlineQueueListenerSet) {
      window.addEventListener('online', () => this.processQueue());
      window._offlineQueueListenerSet = true;
    }
    
    return submissionId;
  }
  
  /**
   * Process queued appointment requests
   */
  async processQueue(): Promise<void> {
    const QUEUE_STORAGE_KEY = STORAGE_KEYS.APPOINTMENT_QUEUE;
    
    // Check if online
    if (!navigator.onLine) {
      return;
    }
    
    // Get queue
    const queueString = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!queueString) {
      return;
    }
    
    const queue = JSON.parse(queueString);
    if (queue.length === 0) {
      return;
    }
    
    this.log('Processing Queue', `Processing ${queue.length} queued appointment requests`);
    
    // Process each item
    const updatedQueue = [];
    for (const item of queue) {
      try {
        // Use the enhanced submitAppointmentRequest from book-appointment.js
        const response = await submitAppointmentRequest(item.data);
        
        this.log('Queue Item Response', {
          itemId: item.id,
          response
        });
        
        if (!response.success) {
          throw new Error(response.message || `Failed to process queued appointment: ${item.id}`);
        }
        
        // Success - don't add back to queue
        this.log('Queue Item Success', `Successfully processed queued appointment: ${item.id}`);
        
        // Dispatch success event
        window.dispatchEvent(new CustomEvent('appointment:processed', {
          detail: { id: item.id, success: true }
        }));
      } catch (error) {
        this.log('Queue Item Error', {
          itemId: item.id, 
          error
        }, true);
        
        // Increment attempt count
        item.attempts = (item.attempts || 0) + 1;
        
        // If max attempts not reached, add back to queue
        if (item.attempts < RETRY_CONFIG.MAX_RETRIES) {
          updatedQueue.push(item);
        } else {
          // Max attempts reached - remove from queue
          this.log('Queue Item Max Attempts', `Maximum attempts reached for appointment ${item.id}, removing from queue`);
          
          // Dispatch failure event
          window.dispatchEvent(new CustomEvent('appointment:processed', {
            detail: { id: item.id, success: false }
          }));
        }
      }
    }
    
    // Update queue
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updatedQueue));
  }

  /**
   * Submit a form directly to the Go High Level form submission endpoint
   */
  async submitForm(formData: any): Promise<AppointmentResponse> {
    try {
      this.log('Submitting Form', formData);
      
      // Transform form data to Go High Level format
      const adaptedFormData = adaptToGoHighLevel(formData);
      
      // Use the enhanced submitAppointmentRequest from book-appointment.js
      const response = await submitAppointmentRequest(adaptedFormData);
      
      // Log complete response
      this.log(
        response.success ? 'Form Submission Response (Success)' : 'Form Submission Response (Error)', 
        response, 
        !response.success
      );
      
      if (!response.success) {
        return {
          success: false,
          message: response.message || 'Failed to submit form',
          error: response.error || 'Unknown error occurred',
          statusCode: response.statusCode,
          rawResponse: response
        };
      }
      
      return {
        success: true,
        message: response.message || 'Form submitted successfully',
        data: response.data,
        rawResponse: response
      };
    } catch (error: any) {
      this.log('Error in submitForm', error, true);
      
      return {
        success: false,
        message: 'Failed to submit form',
        error: error.message || 'An unexpected error occurred',
        rawResponse: error
      };
    }
  }
  
  /**
   * Enable or disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }
}

// Add type definition for window._offlineQueueListenerSet
declare global {
  interface Window {
    _offlineQueueListenerSet?: boolean;
  }
}

// Create singleton instance
const goHighLevelAppointmentClient = new GoHighLevelAppointmentClient();
export default goHighLevelAppointmentClient; 