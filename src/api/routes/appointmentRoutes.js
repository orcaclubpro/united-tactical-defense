/**
 * Appointment Routes
 */

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { isAuthenticated } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private
 */
router.post('/', isAuthenticated, appointmentController.createAppointment);

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments with optional filtering
 * @access  Private
 */
router.get('/', isAuthenticated, appointmentController.getAppointments);

/**
 * @route   GET /api/appointments/available
 * @desc    Get available time slots for a specific date
 * @access  Private
 */
router.get('/available', isAuthenticated, appointmentController.getAvailableTimeSlots);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get appointment by ID
 * @access  Private
 */
router.get('/:id', isAuthenticated, appointmentController.getAppointmentById);

/**
 * @route   PUT /api/appointments/:id/reschedule
 * @desc    Reschedule an appointment
 * @access  Private
 */
router.put('/:id/reschedule', isAuthenticated, appointmentController.rescheduleAppointment);

/**
 * @route   PUT /api/appointments/:id/cancel
 * @desc    Cancel an appointment
 * @access  Private
 */
router.put('/:id/cancel', isAuthenticated, appointmentController.cancelAppointment);

module.exports = router; 