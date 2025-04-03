/**
 * Lead Validators
 * Validation rules for lead-related operations
 */

const { body } = require('express-validator');

/**
 * Validation rules for lead creation
 */
const createValidator = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
    
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
    
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Must provide a valid email address'),
    
  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Must provide a valid phone number'),
    
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Lead source is required')
    .isIn(['website', 'referral', 'social_media', 'advertisement', 'direct', 'other'])
    .withMessage('Invalid lead source'),
    
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'])
    .withMessage('Invalid status value'),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
    
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format for assignedTo'),
    
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array')
];

/**
 * Validation rules for lead update
 */
const updateValidator = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
    
  body('email')
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Must provide a valid email address'),
    
  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Must provide a valid phone number'),
    
  body('source')
    .optional()
    .trim()
    .isIn(['website', 'referral', 'social_media', 'advertisement', 'direct', 'other'])
    .withMessage('Invalid lead source'),
    
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'])
    .withMessage('Invalid status value'),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
    
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format for assignedTo'),
    
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array')
];

module.exports = {
  createValidator,
  updateValidator
}; 