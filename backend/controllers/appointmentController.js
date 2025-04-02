const { getDbConnection } = require('../config/database');

/**
 * Appointment controller with methods for CRUD operations
 */
const appointmentController = {
  // Get all appointments
  getAllAppointments: (req, res, next) => {
    const db = getDbConnection();
    
    db.all(`
      SELECT a.*, l.firstName, l.lastName, l.email, l.phone
      FROM appointments a
      JOIN leads l ON a.lead_id = l.id
      ORDER BY a.appointment_time ASC
    `, [], (err, rows) => {
      db.close();
      
      if (err) {
        return next(err);
      }
      
      res.json({
        success: true,
        data: rows
      });
    });
  },
  
  // Get appointment by ID
  getAppointmentById: (req, res, next) => {
    const { id } = req.params;
    const db = getDbConnection();
    
    db.get(`
      SELECT a.*, l.firstName, l.lastName, l.email, l.phone
      FROM appointments a
      JOIN leads l ON a.lead_id = l.id
      WHERE a.id = ?
    `, [id], (err, row) => {
      db.close();
      
      if (err) {
        return next(err);
      }
      
      if (!row) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Appointment with ID ${id} not found`,
            code: 404
          }
        });
      }
      
      res.json({
        success: true,
        data: row
      });
    });
  },
  
  // Get appointments by lead ID
  getAppointmentsByLeadId: (req, res, next) => {
    const { leadId } = req.params;
    const db = getDbConnection();
    
    db.all(`
      SELECT a.*, l.firstName, l.lastName, l.email, l.phone
      FROM appointments a
      JOIN leads l ON a.lead_id = l.id
      WHERE a.lead_id = ?
      ORDER BY a.appointment_time ASC
    `, [leadId], (err, rows) => {
      db.close();
      
      if (err) {
        return next(err);
      }
      
      res.json({
        success: true,
        data: rows
      });
    });
  },
  
  // Create new appointment
  createAppointment: (req, res, next) => {
    const {
      lead_id,
      title,
      appointment_time,
      duration,
      notes,
      status
    } = req.body;
    
    // Validate required fields
    if (!lead_id || !title || !appointment_time) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Lead ID, title, and appointment time are required',
          code: 400
        }
      });
    }
    
    const db = getDbConnection();
    
    // First check if the lead exists
    db.get('SELECT id FROM leads WHERE id = ?', [lead_id], (err, lead) => {
      if (err) {
        db.close();
        return next(err);
      }
      
      if (!lead) {
        db.close();
        return res.status(404).json({
          success: false,
          error: {
            message: `Lead with ID ${lead_id} not found`,
            code: 404
          }
        });
      }
      
      // Lead exists, create appointment
      const query = `
        INSERT INTO appointments (lead_id, title, appointment_time, duration, notes, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [
        lead_id,
        title,
        appointment_time,
        duration || 60,
        notes || '',
        status || 'scheduled'
      ], function(err) {
        if (err) {
          db.close();
          return next(err);
        }
        
        // Get the created appointment with lead info
        db.get(`
          SELECT a.*, l.firstName, l.lastName, l.email, l.phone
          FROM appointments a
          JOIN leads l ON a.lead_id = l.id
          WHERE a.id = ?
        `, [this.lastID], (err, appointment) => {
          db.close();
          
          if (err) {
            return next(err);
          }
          
          res.status(201).json({
            success: true,
            data: appointment
          });
        });
      });
    });
  },
  
  // Update appointment
  updateAppointment: (req, res, next) => {
    const { id } = req.params;
    const {
      lead_id,
      title,
      appointment_time,
      duration,
      notes,
      status
    } = req.body;
    
    // Validate required fields
    if (!lead_id || !title || !appointment_time) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Lead ID, title, and appointment time are required',
          code: 400
        }
      });
    }
    
    const db = getDbConnection();
    
    // First check if the lead exists
    db.get('SELECT id FROM leads WHERE id = ?', [lead_id], (err, lead) => {
      if (err) {
        db.close();
        return next(err);
      }
      
      if (!lead) {
        db.close();
        return res.status(404).json({
          success: false,
          error: {
            message: `Lead with ID ${lead_id} not found`,
            code: 404
          }
        });
      }
      
      // Lead exists, update appointment
      const query = `
        UPDATE appointments 
        SET lead_id = ?,
            title = ?,
            appointment_time = ?,
            duration = ?,
            notes = ?,
            status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [
        lead_id,
        title,
        appointment_time,
        duration || 60,
        notes || '',
        status || 'scheduled',
        id
      ], function(err) {
        if (err) {
          db.close();
          return next(err);
        }
        
        if (this.changes === 0) {
          db.close();
          return res.status(404).json({
            success: false,
            error: {
              message: `Appointment with ID ${id} not found`,
              code: 404
            }
          });
        }
        
        // Get the updated appointment with lead info
        db.get(`
          SELECT a.*, l.firstName, l.lastName, l.email, l.phone
          FROM appointments a
          JOIN leads l ON a.lead_id = l.id
          WHERE a.id = ?
        `, [id], (err, appointment) => {
          db.close();
          
          if (err) {
            return next(err);
          }
          
          res.json({
            success: true,
            data: appointment
          });
        });
      });
    });
  },
  
  // Delete appointment
  deleteAppointment: (req, res, next) => {
    const { id } = req.params;
    const db = getDbConnection();
    
    db.run('DELETE FROM appointments WHERE id = ?', [id], function(err) {
      db.close();
      
      if (err) {
        return next(err);
      }
      
      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Appointment with ID ${id} not found`,
            code: 404
          }
        });
      }
      
      res.json({
        success: true,
        data: {
          id: parseInt(id),
          message: 'Appointment deleted successfully'
        }
      });
    });
  }
};

module.exports = appointmentController; 