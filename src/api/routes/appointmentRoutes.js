/**
 * Appointment Routes
 */

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private
 */
router.post('/', authenticate, appointmentController.createAppointment);

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments with optional filtering
 * @access  Private
 */
router.get('/', authenticate, appointmentController.getAppointments);

/**
 * @route   GET /api/appointments/available
 * @desc    Get available time slots for a specific date
 * @access  Public (used by booking calendar)
 */
router.get('/available', appointmentController.getAvailableTimeSlots);

/**
 * @route   POST /api/appointments/reserve
 * @desc    Reserve a time slot for booking
 * @access  Public (used by booking form)
 */
router.post('/reserve', appointmentController.reserveTimeSlot);

/**
 * @route   POST /api/appointments/create
 * @desc    Create an appointment directly (used by frontend)
 * @access  Public
 */
router.post('/create', appointmentController.createAppointmentFromForm);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get appointment by ID
 * @access  Private
 */
router.get('/:id', authenticate, appointmentController.getAppointmentById);

/**
 * @route   PUT /api/appointments/:id/reschedule
 * @desc    Reschedule an appointment
 * @access  Private
 */
router.put('/:id/reschedule', authenticate, appointmentController.rescheduleAppointment);

/**
 * @route   PUT /api/appointments/:id/cancel
 * @desc    Cancel an appointment
 * @access  Private
 */
router.put('/:id/cancel', authenticate, appointmentController.cancelAppointment);

module.exports = router; 