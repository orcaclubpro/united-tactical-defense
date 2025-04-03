/**
 * Appointment Repository
 * Implements AppointmentRepositoryInterface
 */

const { AppointmentRepositoryInterface } = require('../../core/interfaces/repositories');
const { Appointment } = require('../../core/entities');
const db = require('../models/db');

class AppointmentRepository extends AppointmentRepositoryInterface {
  /**
   * Find appointment by ID
   * @param {string|number} id - Appointment ID
   * @returns {Promise<Object|null>} - Appointment or null if not found
   */
  async findById(id) {
    try {
      const query = 'SELECT * FROM appointments WHERE id = ?';
      const result = await db.get(query, [id]);
      
      return result ? new Appointment(result) : null;
    } catch (error) {
      console.error('Error in appointmentRepository.findById:', error);
      throw error;
    }
  }

  /**
   * Find all appointments with optional filtering
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Array>} - Array of appointments
   */
  async findAll(filter = {}) {
    try {
      let query = 'SELECT * FROM appointments';
      const params = [];
      
      // Build WHERE clause based on filters
      const conditions = [];
      
      if (filter.leadId) {
        conditions.push('lead_id = ?');
        params.push(filter.leadId);
      }
      
      if (filter.userId) {
        conditions.push('user_id = ?');
        params.push(filter.userId);
      }
      
      if (filter.status) {
        conditions.push('status = ?');
        params.push(filter.status);
      }
      
      if (filter.date) {
        conditions.push('date = ?');
        params.push(filter.date);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      // Add ordering
      query += ' ORDER BY date ASC, time_slot ASC';
      
      const results = await db.all(query, params);
      return results.map(result => new Appointment({
        id: result.id,
        leadId: result.lead_id,
        userId: result.user_id,
        date: result.date,
        timeSlot: result.time_slot,
        duration: result.duration,
        status: result.status,
        notes: result.notes,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      }));
    } catch (error) {
      console.error('Error in appointmentRepository.findAll:', error);
      throw error;
    }
  }

  /**
   * Create a new appointment
   * @param {Object} data - Appointment data
   * @returns {Promise<Object>} - Created appointment
   */
  async create(data) {
    try {
      const appointment = new Appointment(data);
      const now = new Date();
      
      const query = `
        INSERT INTO appointments (
          lead_id, user_id, date, time_slot, duration, status, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        appointment.leadId,
        appointment.userId,
        appointment.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        appointment.timeSlot,
        appointment.duration,
        appointment.status,
        appointment.notes,
        now.toISOString(),
        now.toISOString()
      ];
      
      const result = await db.run(query, params);
      
      appointment.id = result.lastID;
      appointment.createdAt = now;
      appointment.updatedAt = now;
      
      return appointment;
    } catch (error) {
      console.error('Error in appointmentRepository.create:', error);
      throw error;
    }
  }

  /**
   * Update an existing appointment
   * @param {string|number} id - Appointment ID
   * @param {Object} data - Updated appointment data
   * @returns {Promise<Object>} - Updated appointment
   */
  async update(id, data) {
    try {
      const appointment = await this.findById(id);
      
      if (!appointment) {
        throw new Error(`Appointment with ID ${id} not found`);
      }
      
      // Update appointment data
      Object.assign(appointment, data);
      appointment.updatedAt = new Date();
      
      const query = `
        UPDATE appointments SET
          lead_id = ?, 
          user_id = ?,
          date = ?,
          time_slot = ?,
          duration = ?,
          status = ?,
          notes = ?,
          updated_at = ?
        WHERE id = ?
      `;
      
      const params = [
        appointment.leadId,
        appointment.userId,
        appointment.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        appointment.timeSlot,
        appointment.duration,
        appointment.status,
        appointment.notes,
        appointment.updatedAt.toISOString(),
        id
      ];
      
      await db.run(query, params);
      
      return appointment;
    } catch (error) {
      console.error('Error in appointmentRepository.update:', error);
      throw error;
    }
  }

  /**
   * Delete an appointment
   * @param {string|number} id - Appointment ID
   * @returns {Promise<boolean>} - Success flag
   */
  async delete(id) {
    try {
      const query = 'DELETE FROM appointments WHERE id = ?';
      const result = await db.run(query, [id]);
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error in appointmentRepository.delete:', error);
      throw error;
    }
  }

  /**
   * Find appointments by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} - Array of appointments
   */
  async findByDateRange(startDate, endDate) {
    try {
      const query = `
        SELECT * FROM appointments 
        WHERE date >= ? AND date <= ?
        ORDER BY date ASC, time_slot ASC
      `;
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const results = await db.all(query, [startDateStr, endDateStr]);
      
      return results.map(result => new Appointment({
        id: result.id,
        leadId: result.lead_id,
        userId: result.user_id,
        date: result.date,
        timeSlot: result.time_slot,
        duration: result.duration,
        status: result.status,
        notes: result.notes,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      }));
    } catch (error) {
      console.error('Error in appointmentRepository.findByDateRange:', error);
      throw error;
    }
  }

  /**
   * Find appointments by user
   * @param {string|number} userId - User ID
   * @returns {Promise<Array>} - Array of appointments
   */
  async findByUser(userId) {
    try {
      const query = `
        SELECT * FROM appointments 
        WHERE user_id = ?
        ORDER BY date ASC, time_slot ASC
      `;
      
      const results = await db.all(query, [userId]);
      
      return results.map(result => new Appointment({
        id: result.id,
        leadId: result.lead_id,
        userId: result.user_id,
        date: result.date,
        timeSlot: result.time_slot,
        duration: result.duration,
        status: result.status,
        notes: result.notes,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      }));
    } catch (error) {
      console.error('Error in appointmentRepository.findByUser:', error);
      throw error;
    }
  }
  
  /**
   * Check if a time slot is available on a specific date
   * @param {Date} date - The date to check
   * @param {string} timeSlot - The time slot to check
   * @returns {Promise<boolean>} - True if the slot is available
   */
  async isTimeSlotAvailable(date, timeSlot) {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      const query = `
        SELECT COUNT(*) as count FROM appointments 
        WHERE date = ? AND time_slot = ? AND status != 'cancelled'
      `;
      
      const result = await db.get(query, [dateStr, timeSlot]);
      
      return result.count === 0;
    } catch (error) {
      console.error('Error in appointmentRepository.isTimeSlotAvailable:', error);
      throw error;
    }
  }
}

module.exports = new AppointmentRepository(); 