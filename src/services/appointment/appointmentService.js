/**
 * Appointment Service
 * Implements the AppointmentServiceInterface
 */

const { AppointmentServiceInterface } = require('../../core/interfaces/services');
const { Appointment } = require('../../core/entities');
const appointmentRepository = require('../../data/repositories/appointmentRepository');
const leadRepository = require('../../data/repositories/leadRepository');
const userRepository = require('../../data/repositories/userRepository');

class AppointmentService extends AppointmentServiceInterface {
  /**
   * Schedule a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Object>} - Created appointment
   * @throws {Error} If appointment cannot be scheduled
   */
  async scheduleAppointment(appointmentData) {
    try {
      // Validate lead exists
      const lead = await leadRepository.findById(appointmentData.leadId);
      if (!lead) {
        throw new Error(`Lead with ID ${appointmentData.leadId} not found`);
      }
      
      // Validate user exists if provided
      if (appointmentData.userId) {
        const user = await userRepository.findById(appointmentData.userId);
        if (!user) {
          throw new Error(`User with ID ${appointmentData.userId} not found`);
        }
      }
      
      // Check availability
      const isAvailable = await this.checkAvailability(
        new Date(appointmentData.date),
        appointmentData.timeSlot
      );
      
      if (!isAvailable) {
        throw new Error('The selected time slot is not available');
      }
      
      // Create appointment
      return await appointmentRepository.create(appointmentData);
    } catch (error) {
      console.error('Error in appointmentService.scheduleAppointment:', error);
      throw error;
    }
  }

  /**
   * Check availability for a time slot
   * @param {Date} date - Appointment date
   * @param {string} timeSlot - Time slot
   * @returns {Promise<boolean>} - True if available
   */
  async checkAvailability(date, timeSlot) {
    try {
      return await appointmentRepository.isTimeSlotAvailable(date, timeSlot);
    } catch (error) {
      console.error('Error in appointmentService.checkAvailability:', error);
      throw error;
    }
  }

  /**
   * Reschedule an appointment
   * @param {string|number} appointmentId - Appointment ID
   * @param {Date} newDate - New date
   * @param {string} newTimeSlot - New time slot
   * @returns {Promise<Object>} - Updated appointment
   * @throws {Error} If appointment cannot be rescheduled
   */
  async rescheduleAppointment(appointmentId, newDate, newTimeSlot) {
    try {
      // Check if appointment exists
      const appointment = await appointmentRepository.findById(appointmentId);
      if (!appointment) {
        throw new Error(`Appointment with ID ${appointmentId} not found`);
      }
      
      // Check if the appointment is already cancelled
      if (appointment.status === 'cancelled') {
        throw new Error('Cannot reschedule a cancelled appointment');
      }
      
      // Check availability for new time slot
      const isAvailable = await this.checkAvailability(new Date(newDate), newTimeSlot);
      if (!isAvailable) {
        throw new Error('The selected time slot is not available');
      }
      
      // Update appointment
      return await appointmentRepository.update(appointmentId, {
        date: new Date(newDate),
        timeSlot: newTimeSlot,
        status: 'rescheduled'
      });
    } catch (error) {
      console.error('Error in appointmentService.rescheduleAppointment:', error);
      throw error;
    }
  }

  /**
   * Cancel an appointment
   * @param {string|number} appointmentId - Appointment ID
   * @returns {Promise<boolean>} - Success flag
   * @throws {Error} If appointment cannot be cancelled
   */
  async cancelAppointment(appointmentId) {
    try {
      // Check if appointment exists
      const appointment = await appointmentRepository.findById(appointmentId);
      if (!appointment) {
        throw new Error(`Appointment with ID ${appointmentId} not found`);
      }
      
      // Update appointment status
      await appointmentRepository.update(appointmentId, { status: 'cancelled' });
      
      return true;
    } catch (error) {
      console.error('Error in appointmentService.cancelAppointment:', error);
      throw error;
    }
  }
  
  /**
   * Get appointments for a lead
   * @param {string|number} leadId - Lead ID
   * @returns {Promise<Array>} - Array of appointments
   */
  async getAppointmentsForLead(leadId) {
    try {
      return await appointmentRepository.findAll({ leadId });
    } catch (error) {
      console.error('Error in appointmentService.getAppointmentsForLead:', error);
      throw error;
    }
  }
  
  /**
   * Get appointments for a user
   * @param {string|number} userId - User ID
   * @returns {Promise<Array>} - Array of appointments
   */
  async getAppointmentsForUser(userId) {
    try {
      return await appointmentRepository.findByUser(userId);
    } catch (error) {
      console.error('Error in appointmentService.getAppointmentsForUser:', error);
      throw error;
    }
  }
  
  /**
   * Get appointments by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} - Array of appointments
   */
  async getAppointmentsByDateRange(startDate, endDate) {
    try {
      return await appointmentRepository.findByDateRange(startDate, endDate);
    } catch (error) {
      console.error('Error in appointmentService.getAppointmentsByDateRange:', error);
      throw error;
    }
  }
  
  /**
   * Get available time slots for a specific date
   * @param {Date} date - The date to check
   * @returns {Promise<Array>} - Array of available time slots
   */
  async getAvailableTimeSlots(date) {
    try {
      // Define all possible time slots
      const allTimeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00'
      ];
      
      // Get booked appointments for the date
      const appointments = await appointmentRepository.findAll({ 
        date: date.toISOString().split('T')[0] 
      });
      
      // Get booked time slots
      const bookedTimeSlots = appointments
        .filter(app => app.status !== 'cancelled')
        .map(app => app.timeSlot);
      
      // Return available time slots
      return allTimeSlots.filter(slot => !bookedTimeSlots.includes(slot));
    } catch (error) {
      console.error('Error in appointmentService.getAvailableTimeSlots:', error);
      throw error;
    }
  }

  /**
   * Reserve a time slot
   * @param {string} timeSlotId - The ID of the time slot to reserve
   * @param {string} leadId - The ID of the lead
   * @returns {Promise<Object>} - The reservation result
   */
  async reserveTimeSlot(timeSlotId, leadId) {
    try {
      // Validate lead exists
      const lead = await leadRepository.findById(leadId);
      if (!lead) {
        throw new Error(`Lead with ID ${leadId} not found`);
      }
      
      // Parse time slot ID to get date and time
      // Assuming time slot ID format: YYYY-MM-DD_HH:MM or similar
      const [dateStr, timeStr] = timeSlotId.split('_');
      
      if (!dateStr || !timeStr) {
        throw new Error('Invalid time slot ID format');
      }
      
      const date = new Date(dateStr);
      
      // Check if the time slot is available
      const isAvailable = await this.checkAvailability(date, timeStr);
      if (!isAvailable) {
        throw new Error('The selected time slot is not available');
      }
      
      // Create a temporary reservation
      // This could be a new entity in a real application
      const reservation = {
        leadId,
        date: date.toISOString().split('T')[0],
        time: timeStr,
        status: 'reserved',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      };
      
      // In a real application, you would save this reservation
      // For now, just return it
      return reservation;
    } catch (error) {
      console.error('Error in appointmentService.reserveTimeSlot:', error);
      throw error;
    }
  }

  /**
   * Create an appointment directly from form data
   * @param {Object} formData - Form data including name, email, phone, date, etc.
   * @returns {Promise<Object>} - The created appointment
   */
  async createAppointmentFromForm(formData) {
    try {
      // Create or find lead
      let lead = await leadRepository.findByEmail(formData.email);
      
      if (!lead) {
        // Create new lead
        lead = await leadRepository.create({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          source: 'frontend_form',
          program: formData.program || 'default',
          status: 'new'
        });
      }
      
      // Check availability
      const isAvailable = await this.checkAvailability(
        new Date(formData.date),
        formData.timeSlot
      );
      
      if (!isAvailable) {
        throw new Error('The selected time slot is not available');
      }
      
      // Create appointment
      const appointmentData = {
        leadId: lead.id,
        date: formData.date,
        timeSlot: formData.timeSlot,
        type: formData.program || 'free_class',
        status: 'confirmed',
        notes: formData.notes || '',
        source: 'frontend_form'
      };
      
      const appointment = await appointmentRepository.create(appointmentData);
      
      return appointment;
    } catch (error) {
      console.error('Error in appointmentService.createAppointmentFromForm:', error);
      throw error;
    }
  }
}

module.exports = new AppointmentService(); 