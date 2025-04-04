/**
 * Validation Middleware
 * Handles request data validation using Joi
 */

const Joi = require('joi');

/**
 * Validates request data against Joi schema
 * @param {Object} schemas - Object containing schemas for body, query, params
 * @returns {Function} Middleware function
 */
const validate = (schemas) => {
  return (req, res, next) => {
    const options = {
      abortEarly: false, // include all errors
      allowUnknown: true, // ignore unknown props
      stripUnknown: true // remove unknown props
    };
    
    // Validate request body
    if (schemas.body) {
      const { error, value } = schemas.body.validate(req.body, options);
      if (error) {
        return res.status(422).json({
          error: 'Validation Error',
          message: 'The provided data in request body failed validation',
          details: formatValidationError(error)
        });
      }
      req.body = value;
    }
    
    // Validate request query parameters
    if (schemas.query) {
      const { error, value } = schemas.query.validate(req.query, options);
      if (error) {
        return res.status(422).json({
          error: 'Validation Error',
          message: 'The provided query parameters failed validation',
          details: formatValidationError(error)
        });
      }
      req.query = value;
    }
    
    // Validate request path parameters
    if (schemas.params) {
      const { error, value } = schemas.params.validate(req.params, options);
      if (error) {
        return res.status(422).json({
          error: 'Validation Error',
          message: 'The provided path parameters failed validation',
          details: formatValidationError(error)
        });
      }
      req.params = value;
    }
    
    next();
  };
};

/**
 * Format Joi validation errors into a more readable format
 * @param {Object} error - Joi validation error
 * @returns {Object} Formatted error object
 */
const formatValidationError = (error) => {
  const formattedError = {};
  if (error.details && Array.isArray(error.details)) {
    error.details.forEach((detail) => {
      const path = detail.path.join('.');
      if (!formattedError[path]) {
        formattedError[path] = [];
      }
      formattedError[path].push(detail.message);
    });
  }
  return formattedError;
};

module.exports = {
  validate
}; 