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
  },

  // Submit free class form
  submitFreeClassForm: (req, res, next) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      preferredDate,
      experience,
      hearAbout,
      notes
    } = req.body;
    
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
    
    // Create lead from free class form
    db.run(`
      INSERT INTO leads (firstName, lastName, email, phone, source, potentialValue, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      firstName,
      lastName,
      email,
      phone,
      hearAbout || 'Free Class Form',
      '$399', // Default potential value
      'new', // Default status
      notes || `Experience level: ${experience}`
    ], function(err) {
      if (err) {
        db.close();
        return next(err);
      }
      
      const leadId = this.lastID;
      
      // If preferred date is provided, create an appointment
      if (preferredDate) {
        // Use noon as default time if no specific time provided
        const appointmentISO = new Date(`${preferredDate}T12:00:00`).toISOString();
        
        db.run(`
          INSERT INTO appointments (lead_id, title, appointment_time, duration, notes, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          leadId,
          'Free Class Session',
          appointmentISO,
          60, // Default duration in minutes
          `Experience level: ${experience}` + (notes ? `\n${notes}` : ''),
          'pending' // Default status for preferred dates rather than specific appointments
        ], function(err) {
          db.close();
          
          if (err) {
            return next(err);
          }
          
          res.status(201).json({
            success: true,
            message: 'Free class request submitted successfully',
            data: {
              leadId,
              appointmentId: this.lastID
            }
          });
        });
      } else {
        db.close();
        
        res.status(201).json({
          success: true,
          message: 'Free class request submitted successfully',
          data: {
            leadId
          }
        });
      }
    });
  },
  
  // Submit assessment form
  submitAssessmentForm: (req, res, next) => {
    const {
      firstName, 
      lastName,
      email,
      phone,
      trainingGoals,
      currentSkillLevel,
      preferredTrainingDays,
      previousTraining,
      healthConcerns,
      additionalInfo
    } = req.body;
    
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
    
    // Format assessment data for notes
    const assessmentNotes = [
      `Training Goals: ${trainingGoals || 'N/A'}`,
      `Current Skill Level: ${currentSkillLevel || 'N/A'}`,
      `Preferred Training Days: ${preferredTrainingDays ? preferredTrainingDays.join(', ') : 'N/A'}`,
      `Previous Training: ${previousTraining || 'N/A'}`,
      `Health Concerns: ${healthConcerns || 'None'}`,
      `Additional Info: ${additionalInfo || 'N/A'}`
    ].join('\n');
    
    // Create lead from assessment form with detailed notes
    db.run(`
      INSERT INTO leads (firstName, lastName, email, phone, source, potentialValue, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      firstName,
      lastName,
      email,
      phone,
      'Assessment Form',
      '$1,299', // Higher potential value for detailed assessment
      'qualified', // Mark as qualified since they provided detailed information
      assessmentNotes
    ], function(err) {
      db.close();
      
      if (err) {
        return next(err);
      }
      
      res.status(201).json({
        success: true,
        message: 'Assessment form submitted successfully',
        data: {
          id: this.lastID,
          firstName,
          lastName,
          email
        }
      });
    });
  }
};

module.exports = formController; 