const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

// POST submit contact form
router.post('/contact', formController.submitContactForm);

// POST submit appointment request
router.post('/appointment', formController.submitAppointmentRequest);

// POST submit free class request - using the path expected by the frontend
router.post('/free-class', formController.submitFreeClassForm);

// POST submit assessment form - using the path expected by the frontend
router.post('/assessment', formController.submitAssessmentForm);

// Legacy submit all forms handler
router.post('/submit', formController.submitContactForm);

module.exports = router; 