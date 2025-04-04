/**
 * Form Controller
 * Handles HTTP requests for form processing
 */

const { getFormService } = require('../../services/form');
const { FormSubmission } = require('../../core/entities');

/**
 * Get form configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getFormConfig(req, res, next) {
  try {
    const { formType } = req.params;
    
    if (!formType) {
      return res.status(400).json({
        success: false,
        message: 'Form type is required'
      });
    }
    
    const formService = getFormService();
    const formConfig = await formService.getFormConfig(formType);
    
    return res.status(200).json({
      success: true,
      data: formConfig
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
}

/**
 * Validate form data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function validateForm(req, res, next) {
  try {
    const { formType } = req.params;
    const formData = req.body;
    
    if (!formType) {
      return res.status(400).json({
        success: false,
        message: 'Form type is required'
      });
    }
    
    if (!formData) {
      return res.status(400).json({
        success: false,
        message: 'Form data is required'
      });
    }
    
    const formService = getFormService();
    const validationResult = await formService.validateForm(formType, formData);
    
    return res.status(200).json({
      success: validationResult.isValid,
      isValid: validationResult.isValid,
      errors: validationResult.errors || {}
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Submit form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function submitForm(req, res, next) {
  try {
    const { formType } = req.params;
    const formData = req.body;
    
    if (!formType) {
      return res.status(400).json({
        success: false,
        message: 'Form type is required'
      });
    }
    
    if (!formData) {
      return res.status(400).json({
        success: false,
        message: 'Form data is required'
      });
    }
    
    // Gather request information
    const requestInfo = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user ? req.user.id : null,
      sessionId: req.headers['x-session-id'],
      referer: req.headers.referer
    };
    
    // Process form submission
    const formService = getFormService();
    const result = await formService.processFormSubmission(formType, formData, requestInfo);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get form submission by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getFormSubmission(req, res, next) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Form submission ID is required'
      });
    }
    
    const formRepository = require('../../data/repositories/formRepository');
    const form = await formRepository.findById(id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: `Form submission with ID ${id} not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: form
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get form submissions with filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getFormSubmissions(req, res, next) {
  try {
    const { type, status, fromDate, toDate, limit, offset } = req.query;
    
    const filter = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (fromDate) filter.fromDate = new Date(fromDate);
    if (toDate) filter.toDate = new Date(toDate);
    if (limit) filter.limit = parseInt(limit, 10);
    if (offset) filter.offset = parseInt(offset, 10);
    
    const formRepository = require('../../data/repositories/formRepository');
    const forms = await formRepository.findAll(filter);
    
    return res.status(200).json({
      success: true,
      count: forms.length,
      data: forms
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Submit external appointment form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function submitExternalAppointmentForm(req, res, next) {
  try {
    const { adapter } = req.params;
    
    if (!adapter) {
      return res.status(400).json({
        success: false,
        message: 'Adapter type is required'
      });
    }
    
    // Get request information
    const requestInfo = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer,
      origin: req.headers.origin,
      sessionId: req.headers['x-session-id']
    };
    
    // Process external form submission
    const formService = getFormService();
    const result = await formService.processExternalAppointmentSubmission(
      adapter, 
      req.body, 
      requestInfo
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
}

/**
 * Submit free class form - specific endpoint for frontend integration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function submitFreeClassForm(req, res, next) {
  try {
    console.log('============ FREE CLASS FORM SUBMISSION ============');
    console.log('Request headers:', req.headers);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const formData = req.body;
    
    if (!formData) {
      console.log('Error: Form data is missing');
      return res.status(400).json({
        success: false,
        message: 'Form data is required'
      });
    }
    
    // Gather request information
    const requestInfo = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user ? req.user.id : null,
      sessionId: req.headers['x-session-id'],
      referer: req.headers.referer
    };
    
    console.log('Request info:', requestInfo);
    
    // Process form submission
    const formService = getFormService();
    const result = await formService.processFormSubmission('free-class', formData, requestInfo);
    
    console.log('Submission result:', JSON.stringify(result, null, 2));
    
    if (!result.success) {
      console.log('Submission failed:', result);
      return res.status(400).json(result);
    }
    
    console.log('Submission successful!');
    return res.status(200).json(result);
  } catch (error) {
    console.error('Free class form submission error:', error);
    next(error);
  }
}

/**
 * Submit assessment form - specific endpoint for frontend integration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function submitAssessmentForm(req, res, next) {
  try {
    const formData = req.body;
    
    if (!formData) {
      return res.status(400).json({
        success: false,
        message: 'Form data is required'
      });
    }
    
    // Gather request information
    const requestInfo = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user ? req.user.id : null,
      sessionId: req.headers['x-session-id'],
      referer: req.headers.referer
    };
    
    // Process form submission
    const formService = getFormService();
    const result = await formService.processFormSubmission('assessment', formData, requestInfo);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Submit contact form - specific endpoint for frontend integration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function submitContactForm(req, res, next) {
  try {
    const formData = req.body;
    
    if (!formData) {
      return res.status(400).json({
        success: false,
        message: 'Form data is required'
      });
    }
    
    // Gather request information
    const requestInfo = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user ? req.user.id : null,
      sessionId: req.headers['x-session-id'],
      referer: req.headers.referer
    };
    
    // Process form submission
    const formService = getFormService();
    const result = await formService.processFormSubmission('contact', formData, requestInfo);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFormConfig,
  validateForm,
  submitForm,
  getFormSubmission,
  getFormSubmissions,
  submitExternalAppointmentForm,
  submitFreeClassForm,
  submitAssessmentForm,
  submitContactForm
}; 