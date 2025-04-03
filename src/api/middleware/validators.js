/**
 * Validation Middleware
 * Handles request data validation for API routes
 */

const { validationResult } = require('express-validator');

/**
 * Validates request data against schema
 * Returns appropriate error responses when validation fails
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} Middleware function
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check if there are validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    // Format validation errors
    const formattedErrors = errors.array().reduce((acc, error) => {
      const field = error.path;
      if (!acc[field]) {
        acc[field] = [];
      }
      acc[field].push(error.msg);
      return acc;
    }, {});
    
    // Return validation error response
    return res.status(422).json({
      error: 'Validation Error',
      message: 'The provided data failed validation',
      details: formattedErrors
    });
  };
};

/**
 * Sanitizes request data by trimming strings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const sanitizeData = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }
  
  next();
};

/**
 * Schema validation for specific request types
 */

// User schema validations
const userSchemas = {
  // For route: POST /api/auth/register
  register: require('../validators/userValidators').registerValidator,
  
  // For route: POST /api/auth/login
  login: require('../validators/userValidators').loginValidator,
  
  // For route: PUT /api/users/:id
  update: require('../validators/userValidators').updateValidator,
  
  // For route: POST /api/auth/refresh
  refreshToken: require('../validators/userValidators').refreshTokenValidator,
};

// Lead schema validations
const leadSchemas = {
  // For route: POST /api/leads
  create: require('../validators/leadValidators').createValidator,
  
  // For route: PUT /api/leads/:id
  update: require('../validators/leadValidators').updateValidator,
};

// Appointment schema validations
const appointmentSchemas = {
  // For route: POST /api/appointments
  create: require('../validators/appointmentValidators').createValidator,
  
  // For route: PUT /api/appointments/:id
  update: require('../validators/appointmentValidators').updateValidator,
};

module.exports = {
  validate,
  sanitizeData,
  schemas: {
    user: userSchemas,
    lead: leadSchemas,
    appointment: appointmentSchemas
  }
}; 