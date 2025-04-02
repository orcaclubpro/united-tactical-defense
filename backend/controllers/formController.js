const { getDbConnection } = require('../config/database');

/**
 * Form controller for handling form submissions
 */
const formController = {
  // Submit contact form
  submitContactForm: (req, res, next) => {
    const { firstName, lastName, email, phone, message, source } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'First name, last name, email, and phone are required',
          code: 400
        }
      });
    }
    
    const db = getDbConnection();
    
    // Create lead from contact form
    const query = `
      INSERT INTO leads (firstName, lastName, email, phone, source, potentialValue, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
      firstName,
      lastName,
      email,
      phone,
      source || 'Contact Form',
      '$0', // Default potential value
      'new' // Default status
    ], function(err) {
      db.close();
      
      if (err) {
        return next(err);
      }
      
      res.status(201).json({
        success: true,
        message: 'Contact form submitted successfully',
        data: {
          id: this.lastID,
          firstName,
          lastName,
          email,
          phone
        }
      });
    });
  },
  
  // Submit appointment request
  submitAppointmentRequest: (req, res, next) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      appointment_date,
      appointment_time,
      message,
      source
    } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'First name, last name, email, phone, appointment date and time are required',
          code: 400
        }
      });
    }
    
    // Format appointment time
    const appointmentISO = new Date(`${appointment_date}T${appointment_time}`).toISOString();
    
    const db = getDbConnection();
    
    // Create lead first
    db.run(`
      INSERT INTO leads (firstName, lastName, email, phone, source, potentialValue, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      firstName,
      lastName,
      email,
      phone,
      source || 'Appointment Form',
      '$399', // Default potential value
      'new' // Default status
    ], function(err) {
      if (err) {
        db.close();
        return next(err);
      }
      
      const leadId = this.lastID;
      
      // Create appointment
      db.run(`
        INSERT INTO appointments (lead_id, title, appointment_time, duration, notes, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        leadId,
        'Free Introductory Class', // Default title
        appointmentISO,
        60, // Default duration in minutes
        message || '',
        'scheduled' // Default status
      ], function(err) {
        db.close();
        
        if (err) {
          return next(err);
        }
        
        res.status(201).json({
          success: true,
          message: 'Appointment request submitted successfully',
          data: {
            leadId,
            appointmentId: this.lastID,
            firstName,
            lastName,
            email,
            phone,
            appointmentTime: appointmentISO
          }
        });
      });
    });
  }
};

module.exports = formController; 