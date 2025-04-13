const appointmentService = require('../services/appointmentService');
const { validateAppointment } = require('../utils/validators');
const { logger } = require('../utils/logger');

/**
 * Create a new appointment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createAppointment = async (req, res, next) => {
  try {
    logger.info('Create appointment request received', { 
      clientName: req.body.name,
      email: req.body.email,
      date: req.body.date
    });
    
    // Validate the request data
    const { isValid, errors } = validateAppointment(req.body);
    
    if (!isValid) {
      logger.warn('Appointment validation failed', { errors });
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }
    
    // Create appointment using the service
    const result = await appointmentService.createAppointment(req.body);
    
    logger.info('Appointment created successfully', { 
      appointmentId: result.id,
      date: result.date,
      time: result.time
    });
    
    // Return response
    res.status(201).json({
      message: 'Appointment submitted successfully',
      appointmentId: result.id,
      appointmentDetails: {
        date: result.date,
        time: result.time
      }
    });
  } catch (error) {
    logger.error('Error creating appointment', {
      error: error.message,
      requestData: req.body
    });
    next(error);
  }
};

/**
 * Get all appointments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllAppointments = async (req, res, next) => {
  try {
    logger.info('Get all appointments request received');
    
    const appointments = await appointmentService.getAllAppointments();
    
    logger.info('Retrieved all appointments', { 
      count: appointments.length 
    });
    
    res.json({ appointments });
  } catch (error) {
    logger.error('Error getting all appointments', { 
      error: error.message 
    });
    next(error);
  }
};

/**
 * Get a specific appointment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info('Get appointment by ID request received', { appointmentId: id });
    
    const appointment = await appointmentService.getAppointmentById(id);
    
    if (!appointment) {
      logger.warn('Appointment not found', { appointmentId: id });
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    logger.info('Appointment retrieved successfully', { appointmentId: id });
    res.json({ appointment });
  } catch (error) {
    logger.error('Error getting appointment by ID', { 
      appointmentId: req.params.id,
      error: error.message 
    });
    next(error);
  }
}; 