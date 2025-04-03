/**
 * User Validators
 * Validation rules for user-related operations
 */

const { body } = require('express-validator');

/**
 * Validation rules for user registration
 */
const registerValidator = [
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
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Must provide a valid phone number'),
    
  body('role')
    .optional()
    .isIn(['user', 'admin', 'manager'])
    .withMessage('Invalid role specified')
];

/**
 * Validation rules for user login
 */
const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Must provide a valid email address'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for user profile update
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
    
  body('role')
    .optional()
    .isIn(['user', 'admin', 'manager'])
    .withMessage('Invalid role specified')
];

/**
 * Validation rules for refresh token
 */
const refreshTokenValidator = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

module.exports = {
  registerValidator,
  loginValidator,
  updateValidator,
  refreshTokenValidator
}; 