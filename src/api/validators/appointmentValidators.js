/**
 * Appointment Validators
 * Validation rules for appointment-related operations
 */

const { body } = require('express-validator');

/**
 * Validation rules for appointment creation
 */
const createValidator = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
    
  body('appointmentDate')
    .isISO8601()
    .withMessage('Must provide a valid date in ISO 8601 format (YYYY-MM-DDTHH:MM:SS.sssZ)')
    .custom(value => {
      const date = new Date(value);
      const now = new Date();
      if (date < now) {
        throw new Error('Appointment date must be in the future');
      }
      return true;
    }),
    
  body('duration')
    .isInt({ min: 15, max: 240 })
    .withMessage('Duration must be between 15 and 240 minutes'),
    
  body('leadId')
    .isMongoId()
    .withMessage('Invalid lead ID format'),
    
  body('assignedUserId')
    .isMongoId()
    .withMessage('Invalid user ID format'),
    
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
    
  body('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'cancelled', 'completed', 'rescheduled'])
    .withMessage('Invalid appointment status'),
    
  body('reminders')
    .optional()
    .isArray()
    .withMessage('Reminders must be an array'),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

/**
 * Validation rules for appointment update
 */
const updateValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
    
  body('appointmentDate')
    .optional()
    .isISO8601()
    .withMessage('Must provide a valid date in ISO 8601 format (YYYY-MM-DDTHH:MM:SS.sssZ)')
    .custom(value => {
      const date = new Date(value);
      const now = new Date();
      if (date < now) {
        throw new Error('Appointment date must be in the future');
      }
      return true;
    }),
    
  body('duration')
    .optional()
    .isInt({ min: 15, max: 240 })
    .withMessage('Duration must be between 15 and 240 minutes'),
    
  body('leadId')
    .optional()
    .isMongoId()
    .withMessage('Invalid lead ID format'),
    
  body('assignedUserId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format'),
    
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
    
  body('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'cancelled', 'completed', 'rescheduled'])
    .withMessage('Invalid appointment status'),
    
  body('reminders')
    .optional()
    .isArray()
    .withMessage('Reminders must be an array'),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

module.exports = {
  createValidator,
  updateValidator
}; 