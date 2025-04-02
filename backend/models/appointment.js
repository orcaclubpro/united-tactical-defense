const { getDbConnection } = require('../config/database');

class Appointment {
  // Get all appointments with optional filtering
  static getAll(filters = {}, limit = 100, offset = 0) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      
      // Join with leads to get lead information
      let query = `
        SELECT a.*, l.firstName, l.lastName, l.email, l.phone 
        FROM appointments a
        JOIN leads l ON a.lead_id = l.id
      `;
      
      const params = [];
      
      // Apply filters if provided
      if (Object.keys(filters).length > 0) {
        const whereConditions = [];
        
        for (const [key, value] of Object.entries(filters)) {
          if (key.startsWith('lead.')) {
            // Handle lead table fields
            const leadField = key.substring(5);
            whereConditions.push(`l.${leadField} = ?`);
          } else {
            // Handle appointment table fields
            whereConditions.push(`a.${key} = ?`);
          }
          params.push(value);
        }
        
        query += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      // Add pagination
      query += ' ORDER BY a.appointment_time ASC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      db.all(query, params, (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get appointment by ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      
      const query = `
        SELECT a.*, l.firstName, l.lastName, l.email, l.phone 
        FROM appointments a
        JOIN leads l ON a.lead_id = l.id
        WHERE a.id = ?
      `;
      
      db.get(query, [id], (err, row) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Create a new appointment
  static create(appointmentData) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      
      const {
        lead_id,
        title,
        appointment_time,
        duration = 60,
        notes = '',
        status = 'scheduled'
      } = appointmentData;
      
      const query = `
        INSERT INTO appointments (lead_id, title, appointment_time, duration, notes, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [lead_id, title, appointment_time, duration, notes, status], function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            ...appointmentData
          });
        }
      });
    });
  }

  // Update an existing appointment
  static update(id, appointmentData) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      
      // Build update fields dynamically based on provided data
      const updateFields = [];
      const params = [];
      
      for (const [key, value] of Object.entries(appointmentData)) {
        updateFields.push(`${key} = ?`);
        params.push(value);
      }
      
      // Add updated_at timestamp
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      
      // Add ID to params
      params.push(id);
      
      const query = `
        UPDATE appointments 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;
      
      db.run(query, params, function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({
            id,
            ...appointmentData,
            changes: this.changes
          });
        }
      });
    });
  }

  // Delete an appointment
  static delete(id) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      
      db.run('DELETE FROM appointments WHERE id = ?', [id], function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({ 
            id, 
            deleted: this.changes > 0 
          });
        }
      });
    });
  }

  // Get upcoming appointments
  static getUpcoming(limit = 10) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      
      const query = `
        SELECT a.*, l.firstName, l.lastName, l.email, l.phone 
        FROM appointments a
        JOIN leads l ON a.lead_id = l.id
        WHERE a.appointment_time > datetime('now')
        AND a.status = 'scheduled'
        ORDER BY a.appointment_time ASC
        LIMIT ?
      `;
      
      db.all(query, [limit], (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = Appointment; 