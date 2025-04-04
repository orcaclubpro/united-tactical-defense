/**
 * Form Routes
 * API endpoints for form processing
 */

const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validators');
const { validate } = require('../middleware/validationMiddleware');
const Joi = require('joi');
const axios = require('axios');

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

// Direct endpoints for specific form types, matching frontend API paths
// Free class form submission
router.post(
  '/free-class',
  formController.submitFreeClassForm
);

// Assessment form submission
router.post(
  '/assessment',
  formController.submitAssessmentForm
);

// Contact form submission
router.post(
  '/contact',
  formController.submitContactForm
);

// Generic form submission endpoint
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
  authenticate,
  authorize(['admin', 'manager']),
  formController.getFormSubmissions
);

// Get form submission by ID (protected, requires authentication)
router.get(
  '/submissions/:id',
  authenticate,
  authorize(['admin', 'manager']),
  formController.getFormSubmission
);

// Direct Go High Level form submission endpoint
// This bypasses the proxy and directly forwards the request to Go High Level
router.post('/go-high-level-submit', async (req, res) => {
  try {
    console.log('\n============ GO HIGH LEVEL REQUEST ============');
    console.log('Request URL: https://backend.leadconnectorhq.com/forms/submit');
    console.log('Request Method: POST');
    console.log('Request Headers:', JSON.stringify({
      'Content-Type': req.headers['content-type'],
      'User-Agent': req.headers['user-agent'],
      'Origin': 'https://unitedtacticaldefense.com',
      'Referer': 'https://unitedtacticaldefense.com/',
      'Accept': req.headers['accept'],
      'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.5',
    }, null, 2));
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('============ END REQUEST ============\n');
    
    // Send the request to Go High Level
    const response = await axios.post(
      'https://backend.leadconnectorhq.com/forms/submit',
      req.body,
      {
        headers: {
          'Content-Type': req.headers['content-type'],
          'User-Agent': req.headers['user-agent'],
          'Origin': 'https://unitedtacticaldefense.com',
          'Referer': 'https://unitedtacticaldefense.com/',
          'Accept': req.headers['accept'],
          'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.5',
        }
      }
    );
    
    // Log the complete response
    console.log('\n============ GO HIGH LEVEL RESPONSE ============');
    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);
    console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('============ END RESPONSE ============\n');
    
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('\n============ GO HIGH LEVEL ERROR ============');
    console.error('Error Message:', error.message);
    
    // Pass through the error response if available
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from Go High Level',
        error: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request was made but no response received');
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error setting up the request');
    }
    console.error('============ END ERROR ============\n');
    
    return res.status(500).json({
      success: false,
      message: 'Failed to send request to Go High Level',
      error: error.message
    });
  }
});

module.exports = router; 