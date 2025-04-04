/**
 * Appointment Controller
 * Handles appointment-related API endpoints
 */

const appointmentService = require('../../services/appointment/appointmentService');
const appointmentRepository = require('../../data/repositories/appointmentRepository');

/**
 * Create a new appointment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createAppointment = async (req, res) => {
  try {
    const appointmentData = req.body;
    
    // Add validation here
    if (!appointmentData.leadId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lead ID is required'
      });
    }
    
    if (!appointmentData.date || !appointmentData.timeSlot) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date and time slot are required'
      });
    }
    
    // Schedule appointment
    const appointment = await appointmentService.scheduleAppointment(appointmentData);
    
    return res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment scheduled successfully'
    });
  } catch (error) {
    console.error('Error in appointmentController.createAppointment:', error);
    
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to schedule appointment'
    });
  }
};

/**
 * Get all appointments with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAppointments = async (req, res) => {
  try {
    let appointments;
    
    // Check if filtering by lead
    if (req.query.leadId) {
      appointments = await appointmentService.getAppointmentsForLead(req.query.leadId);
    }
    // Check if filtering by user
    else if (req.query.userId) {
      appointments = await appointmentService.getAppointmentsForUser(req.query.userId);
    }
    // Check if filtering by date range
    else if (req.query.startDate && req.query.endDate) {
      appointments = await appointmentService.getAppointmentsByDateRange(
        new Date(req.query.startDate),
        new Date(req.query.endDate)
      );
    }
    // Otherwise, return all appointments
    else {
      appointments = await appointmentService.getAppointmentsByDateRange(
        new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
        new Date(new Date().setDate(new Date().getDate() + 90))  // Next 90 days
      );
    }
    
    return res.status(200).json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error('Error in appointmentController.getAppointments:', error);
    
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve appointments'
    });
  }
};

/**
 * Get available time slots for a specific date
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAvailableTimeSlots = async (req, res) => {
  try {
    if (!req.query.date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date parameter is required'
      });
    }
    
    const date = new Date(req.query.date);
    const availableSlots = await appointmentService.getAvailableTimeSlots(date);
    
    return res.status(200).json({
      success: true,
      data: availableSlots,
      count: availableSlots.length
    });
  } catch (error) {
    console.error('Error in appointmentController.getAvailableTimeSlots:', error);
    
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve available time slots'
    });
  }
};

/**
 * Get appointment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAppointmentById = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await appointmentRepository.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `Appointment with ID ${appointmentId} not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error in appointmentController.getAppointmentById:', error);
    
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve appointment'
    });
  }
};

/**
 * Reschedule an appointment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const rescheduleAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { date, timeSlot } = req.body;
    
    if (!date || !timeSlot) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date and time slot are required'
      });
    }
    
    const appointment = await appointmentService.rescheduleAppointment(
      appointmentId,
      new Date(date),
      timeSlot
    );
    
    return res.status(200).json({
      success: true,
      data: appointment,
      message: 'Appointment rescheduled successfully'
    });
  } catch (error) {
    console.error('Error in appointmentController.rescheduleAppointment:', error);
    
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to reschedule appointment'
    });
  }
};

/**
 * Cancel an appointment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    
    await appointmentService.cancelAppointment(appointmentId);
    
    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Error in appointmentController.cancelAppointment:', error);
    
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to cancel appointment'
    });
  }
};

/**
 * Reserve a time slot for an appointment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const reserveTimeSlot = async (req, res) => {
  try {
    const { leadId, timeSlotId } = req.body;
    
    if (!leadId || !timeSlotId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lead ID and time slot ID are required'
      });
    }
    
    // Reserve the time slot
    const reservation = await appointmentService.reserveTimeSlot(timeSlotId, leadId);
    
    return res.status(200).json({
      success: true,
      data: reservation,
      message: 'Time slot reserved successfully'
    });
  } catch (error) {
    console.error('Error in appointmentController.reserveTimeSlot:', error);
    
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to reserve time slot'
    });
  }
};

/**
 * Create an appointment directly from the frontend form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createAppointmentFromForm = async (req, res) => {
  try {
    const formData = req.body;
    
    // Validate the form data
    if (!formData.name || !formData.email || !formData.phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and phone are required'
      });
    }
    
    if (!formData.appointmentDate || !formData.appointmentTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Appointment date and time are required'
      });
    }
    
    // Format the appointment data
    const appointmentData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      date: formData.appointmentDate,
      timeSlot: formData.appointmentTime,
      program: formData.program || 'default',
      notes: formData.notes || ''
    };
    
    // Create appointment from form data
    const appointment = await appointmentService.createAppointmentFromForm(appointmentData);
    
    return res.status(201).json({
      success: true,
      data: {
        appointment: appointment
      },
      message: 'Appointment created successfully'
    });
  } catch (error) {
    console.error('Error in appointmentController.createAppointmentFromForm:', error);
    
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create appointment'
    });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  getAvailableTimeSlots,
  rescheduleAppointment,
  cancelAppointment,
  reserveTimeSlot,
  createAppointmentFromForm
}; 