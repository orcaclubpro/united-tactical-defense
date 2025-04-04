import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

/**
 * FormAPIClient is the central client for all form operations.
 * It handles form retrieval, submission, and validation.
 */
class FormAPIClient {
  private client: AxiosInstance;
  private retryCount: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    this.client = axios.create({
      baseURL: '/',  // Don't include /api here to avoid duplication
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth tokens and to add /api prefix
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Only add /api prefix if the URL doesn't already have it and is not an absolute URL
        if (!config.url?.startsWith('/api') && !config.url?.startsWith('http')) {
          config.url = `/api${config.url}`;
        }
        
        // For debugging
        console.log(`[FormAPI] Making request to: ${config.url}`);
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      this.handleError.bind(this)
    );
  }

  /**
   * Handle API errors with retry logic
   */
  private async handleError(error: AxiosError, retryCount = 0): Promise<any> {
    const config = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Only retry on network errors or 5xx errors
    const shouldRetry = 
      !error.response || 
      (error.response.status >= 500 && error.response.status < 600);
    
    if (shouldRetry && retryCount < this.retryCount && config) {
      retryCount += 1;
      config._retry = true;
      
      // Exponential backoff
      const delay = this.retryDelay * Math.pow(2, retryCount - 1);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return this.client(config).catch((err) => this.handleError(err, retryCount));
    }
    
    return Promise.reject(error);
  }

  /**
   * Submit a form to the backend
   */
  async submitForm(
    formType: string, 
    formData: Record<string, any>
  ): Promise<any> {
    try {
      // Using formType directly in the URL to make the routing clearer
      // No need to prefix with /api since the baseURL already has it
      const response = await this.client.post(`/form/${formType}`, formData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error submitting form:', error);
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  /**
   * Validate form data against backend validation rules
   */
  async validateForm(
    formType: string,
    formData: Record<string, any>,
    step?: string
  ): Promise<any> {
    try {
      const response = await this.client.post('/forms/validate', {
        formType,
        formData,
        step
      });
      
      return {
        isValid: response.data.isValid,
        errors: response.data.errors || {}
      };
    } catch (error) {
      console.error('Error validating form:', error);
      return {
        isValid: false,
        errors: {
          _form: 'Could not validate form. Please try again.'
        }
      };
    }
  }

  /**
   * Submit a lesson booking request
   */
  async submitLessonRequest(bookingData: {
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    timeSlotId: string;
    programType?: string;
  }): Promise<any> {
    try {
      const response = await this.client.post('/appointments/lesson-request', bookingData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error booking lesson:', error);
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  /**
   * Format error messages from API responses
   */
  private formatError(error: any): string {
    if (error.response && error.response.data) {
      if (error.response.data.error) {
        return error.response.data.error;
      }
      if (error.response.data.message) {
        return error.response.data.message;
      }
      if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
        return error.response.data.errors.map((e: any) => e.msg).join(', ');
      }
    }
    return 'An unexpected error occurred. Please try again.';
  }
}

// Create singleton instance
const formAPIClient = new FormAPIClient();
export default formAPIClient; 