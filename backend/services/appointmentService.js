const db = require('../db');
const fetch = require('node-fetch');
const { logger } = require('../utils/logger');

/**
 * Create a new appointment in the database and forward to external API
 * @param {Object} appointmentData - Appointment data
 * @returns {Object} Created appointment data
 */

exports.createAppointment = async (appointmentData) => {
  const { first_name, last_name, email, phone, sel_time, duration = 90 } = appointmentData;
  
  logger.debug('Starting appointment creation process', { email, sel_time });
  
  // Insert into database
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO appointment (first_name, last_name, email, phone, sel_time, duration) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(first_name, last_name, email, phone, sel_time, duration, async function(err) {
      if (err) {
        logger.error('Database error while creating appointment', { 
          error: err.message,
          email,
          sel_time
        });
        return reject(new Error('Database error'));
      }
      
      const appointmentId = this.lastID;
      logger.info(`Inserted appointment with ID ${appointmentId}`, { appointmentId });
      
      try {
        // Forward to external API if needed
        logger.debug('Forwarding appointment to external API', { appointmentId });
        await forwardToExternalAPI(appointmentData);
        
        // Parse the date and time from sel_time (now handling timezone offset)
        const dateTimeParts = sel_time.split('T');
        const date = dateTimeParts[0];
        const time = dateTimeParts[1].substring(0, 5); // Just the HH:MM part
        
        logger.info('Appointment creation completed successfully', { appointmentId });
        resolve({
          id: appointmentId,
          date,
          time,
          duration,
          ...appointmentData
        });
      } catch (apiError) {
        logger.error('External API error during appointment creation', { 
          appointmentId,
          error: apiError.message
        });
        // Still return success even if external API fails
        
        const dateTimeParts = sel_time.split('T');
        const date = dateTimeParts[0];
        const time = dateTimeParts[1].substring(0, 5); // Just the HH:MM part
        
        resolve({
          id: appointmentId,
          date,
          time,
          duration,
          externalApiError: apiError.message,
          ...appointmentData
        });
      }
    });
    
    stmt.finalize();
  });
};

/**
 * Get all appointments from the database
 * @returns {Array} List of appointments
 */
exports.getAllAppointments = () => {
  logger.debug('Fetching all appointments from database');
  
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM appointment ORDER BY id DESC', (err, rows) => {
      if (err) {
        logger.error('Error fetching all appointments', { error: err.message });
        return reject(new Error('Database error'));
      }
      logger.debug('Successfully retrieved all appointments', { count: rows.length });
      resolve(rows);
    });
  });
};

/**
 * Get a specific appointment by ID
 * @param {number} id - Appointment ID
 * @returns {Object|null} Appointment data or null if not found
 */
exports.getAppointmentById = (id) => {
  logger.debug('Fetching appointment by ID', { appointmentId: id });
  
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM appointment WHERE id = ?', [id], (err, row) => {
      if (err) {
        logger.error('Error fetching appointment by ID', { 
          appointmentId: id,
          error: err.message
        });
        return reject(new Error('Database error'));
      }
      
      if (!row) {
        logger.debug('Appointment not found', { appointmentId: id });
      } else {
        logger.debug('Appointment retrieved successfully', { appointmentId: id });
      }
      
      resolve(row || null);
    });
  });
};

/**
 * Forward appointment data to an external API
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} External API response
 */
async function forwardToExternalAPI(appointmentData) {
  const { first_name, last_name, email, phone, sel_time, duration = 90 } = appointmentData;
  
  logger.debug('Preparing to forward appointment to external API', { 
    email,
    sel_time
  });
  
  // Prepare multipart form data
  const boundary = '----geckoformboundary' + Math.random().toString(16).substring(2);
  let body = '';

  const formData = {
    cLNizIhBIdwpbrfvmqH8: [],
    first_name,
    last_name,
    phone,
    email,
    formId: "bHbGRJjmTWG67GNRFqQY",
    location_id: "wCjIiRV3L99XP2J5wYdA",
    calendar_id: "EwO4iAyVRl5dqwH9pi1O",
    selected_slot: sel_time,
    selected_timezone: "America/Los_Angeles",
    session_duration: duration, // 90-minute session by default
    sessionId: "48cf5a1e-fb67-4788-8c37-" + Math.random().toString(16).substring(2), // Generate unique session ID
    eventData: {
      source: "website",
      timestamp: Date.now(),
      type: "appointment",
      domain: "uniteddefensetactical.com",
      version: "v3"
    }
  };

  // Construct multipart form data
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="formData"\r\n\r\n';
  body += JSON.stringify(formData) + '\r\n';

  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="locationId"\r\n\r\n';
  body += 'wCjIiRV3L99XP2J5wYdA\r\n';

  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="formId"\r\n\r\n';
  body += 'bHbGRJjmTWG67GNRFqQY\r\n';

  // Close the multipart form data
  body += `--${boundary}--\r\n`;

  // Define the request options for the external API
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'User-Agent': 'Mozilla/5.0 (Node.js)',
      'Accept': '*/*'
    },
    body: body
  };

  logger.info('Sending appointment data to external API', { 
    email,
    sel_time,
    apiEndpoint: 'https://backend.leadconnectorhq.com/appengine/appointment'
  });

  // This is a placeholder for the actual API call
  // In production, you would replace this with the actual API endpoint
  try {
    const response = await fetch('https://backend.leadconnectorhq.com/appengine/appointment', options);
    const data = await response.json();
    logger.info('External API response received', { 
      statusCode: response.status,
      responseData: data
    });
    return data;
  } catch (error) {
    logger.error('Error forwarding to external API', { 
      error: error.message,
      email
    });
    throw new Error('External API error');
  }
} 
