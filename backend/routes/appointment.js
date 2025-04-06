const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const multer = require('multer');
const upload = multer();

/**
 * @route POST /submit-appointment
 * @desc Submit a new appointment
 * @access Public
 */
router.post('/', upload.none(), appointmentController.createAppointment);

/**
 * @route GET /submit-appointment
 * @desc Get all appointments
 * @access Public
 */
router.get('/', appointmentController.getAllAppointments);

/**
 * @route GET /submit-appointment/:id
 * @desc Get a specific appointment by ID
 * @access Public
 */
router.get('/:id', appointmentController.getAppointmentById);

module.exports = router; 