/**
 * Form Routes
 * API endpoints for form processing
 */

const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { auth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validators');

// Get form configuration
router.get(
  '/config/:formType',
  formController.getFormConfig
);

// Validate form data
router.post(
  '/validate/:formType',
  formController.validateForm
);

// Submit form
router.post(
  '/submit/:formType',
  formController.submitForm
);

// Submit external appointment form using specific adapter
router.post(
  '/external/appointment/:adapter',
  formController.submitExternalAppointmentForm
);

// Get form submissions (protected, requires authentication)
router.get(
  '/submissions',
  auth(['admin', 'manager']),
  formController.getFormSubmissions
);

// Get form submission by ID (protected, requires authentication)
router.get(
  '/submissions/:id',
  auth(['admin', 'manager']),
  formController.getFormSubmission
);

module.exports = router; 