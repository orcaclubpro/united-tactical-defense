import axios, { AxiosInstance, AxiosError } from 'axios';
import goHighLevelAppointmentClient from './GoHighLevelAppointmentClient';

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  endTime: string;
  status: 'available' | 'booked' | 'pending' | 'blocked';
}

/**
 * CalendarAPIClient handles all appointment and availability-related API requests.
 */
class CalendarAPIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 8000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get available time slots for a specific date
   */
  async getAvailableTimeSlots(
    date: string,
    programType?: string
  ): Promise<TimeSlot[]> {
    try {
      const params: Record<string, string> = { date };
      if (programType) {
        params.programType = programType;
      }
      
      const response = await this.client.get('/appointments/available', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching time slots:', error);
      return [];
    }
  }

  /**
   * Get available dates for a month
   */
  async getAvailableDatesForMonth(
    year: number,
    month: number,
    programType?: string
  ): Promise<string[]> {
    try {
      const params: Record<string, string> = { 
        year: year.toString(),
        month: month.toString()
      };
      
      if (programType) {
        params.programType = programType;
      }
      
      const response = await this.client.get('/appointments/available-dates', { params });
      return response.data.dates;
    } catch (error) {
      console.error('Error fetching available dates:', error);
      return [];
    }
  }
  
  /**
   * Check if a specific time slot is available
   */
  async checkTimeSlotAvailability(timeSlotId: string): Promise<boolean> {
    try {
      const response = await this.client.get(`/appointments/time-slot/${timeSlotId}`);
      return response.data.status === 'available';
    } catch (error) {
      console.error('Error checking time slot:', error);
      return false;
    }
  }
  
  /**
   * Book a time slot using the internal API
   */
  async bookTimeSlot(bookingData: {
    timeSlotId: string;
    name: string;
    email: string;
    phone: string;
    programType?: string;
  }): Promise<any> {
    try {
      const response = await this.client.post('/appointments/book', bookingData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }
  
  /**
   * Book a time slot using Go High Level
   * This is the preferred method for booking tactical defense appointments
   */
  async bookTacticalDefenseAppointment(bookingData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    timezone?: string;
    programType?: string;
    [key: string]: any;
  }): Promise<any> {
    // Transform the data in the format needed for Go High Level
    const formattedData = {
      ...bookingData,
      // Convert date and time to selected_slot in the correct format
      selected_slot: `${bookingData.date}T${bookingData.time}:00-07:00`,
    };
    
    // Use the Go High Level client for submission
    return goHighLevelAppointmentClient.submitWithOfflineSupport(formattedData);
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
const calendarAPIClient = new CalendarAPIClient();
export default calendarAPIClient; 