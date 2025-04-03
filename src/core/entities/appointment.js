/**
 * Appointment Entity
 * Represents an appointment in the system
 */

class Appointment {
  /**
   * Create a new Appointment
   * @param {Object} data - Appointment data
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.leadId = data.leadId || null;
    this.userId = data.userId || null;
    this.date = data.date ? new Date(data.date) : new Date();
    this.timeSlot = data.timeSlot || '';
    this.duration = data.duration || 60; // Default 60 minutes
    this.status = data.status || 'scheduled';
    this.notes = data.notes || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
    
    this.validate();
  }
  
  /**
   * Validate appointment data
   * @throws {Error} - If validation fails
   */
  validate() {
    if (!this.leadId) {
      throw new Error('Appointment must be associated with a lead');
    }
    
    if (!this.timeSlot) {
      throw new Error('Appointment must have a time slot');
    }
    
    if (this.duration <= 0) {
      throw new Error('Appointment duration must be positive');
    }
    
    const validStatuses = ['scheduled', 'canceled', 'completed', 'no-show'];
    if (this.status && !validStatuses.includes(this.status)) {
      throw new Error(`Invalid appointment status. Must be one of: ${validStatuses.join(', ')}`);
    }
  }
  
  /**
   * Get display time
   * @returns {string} - Formatted time slot
   */
  getDisplayTime() {
    return this.timeSlot;
  }
  
  /**
   * Get display date
   * @returns {string} - Formatted date
   */
  getDisplayDate() {
    return this.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  /**
   * Check if appointment is upcoming
   * @returns {boolean} - True if appointment is upcoming
   */
  isUpcoming() {
    const now = new Date();
    const appointmentDateTime = new Date(this.date);
    const [hours, minutes] = this.timeSlot.split(':').map(Number);
    
    appointmentDateTime.setHours(hours, minutes, 0, 0);
    
    return appointmentDateTime > now;
  }
  
  /**
   * Cancel the appointment
   * @param {string} reason - Cancellation reason
   * @returns {Appointment} - This appointment instance
   */
  cancel(reason = '') {
    this.status = 'canceled';
    this.notes = this.notes ? `${this.notes}\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
    this.updatedAt = new Date();
    
    return this;
  }
  
  /**
   * Mark appointment as completed
   * @param {string} notes - Additional notes
   * @returns {Appointment} - This appointment instance
   */
  complete(notes = '') {
    this.status = 'completed';
    this.notes = this.notes ? `${this.notes}\nCompletion notes: ${notes}` : `Completion notes: ${notes}`;
    this.updatedAt = new Date();
    
    return this;
  }
  
  /**
   * Mark appointment as no-show
   * @returns {Appointment} - This appointment instance
   */
  markNoShow() {
    this.status = 'no-show';
    this.updatedAt = new Date();
    
    return this;
  }
  
  /**
   * Reschedule the appointment
   * @param {Date} newDate - New date
   * @param {string} newTimeSlot - New time slot
   * @returns {Appointment} - This appointment instance
   */
  reschedule(newDate, newTimeSlot) {
    const oldDate = this.getDisplayDate();
    const oldTimeSlot = this.timeSlot;
    
    this.date = new Date(newDate);
    this.timeSlot = newTimeSlot;
    this.updatedAt = new Date();
    
    this.notes = this.notes 
      ? `${this.notes}\nRescheduled from ${oldDate} ${oldTimeSlot} to ${this.getDisplayDate()} ${this.timeSlot}`
      : `Rescheduled from ${oldDate} ${oldTimeSlot}`;
    
    return this;
  }
}

module.exports = Appointment; 