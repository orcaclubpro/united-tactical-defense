const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// GET all appointments
router.get('/', appointmentController.getAllAppointments);

// GET appointment by ID
router.get('/:id', appointmentController.getAppointmentById);

// GET appointments by lead ID
router.get('/lead/:leadId', appointmentController.getAppointmentsByLeadId);

// POST create new appointment
router.post('/', appointmentController.createAppointment);

// PUT update appointment
router.put('/:id', appointmentController.updateAppointment);

// DELETE appointment
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router; 