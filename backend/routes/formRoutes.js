const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

// POST submit contact form
router.post('/contact', formController.submitContactForm);

// POST submit appointment request
router.post('/appointment', formController.submitAppointmentRequest);

module.exports = router; 