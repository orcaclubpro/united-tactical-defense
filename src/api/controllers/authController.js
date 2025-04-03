/**
 * Authentication Controller
 * Handles user authentication and registration
 */

const { createError } = require('../middleware/errorHandler');

/**
 * Dependency Injection Container
 * Will be set during application bootstrap
 */
let authService = null;

/**
 * Set the authentication service implementation
 * @param {Object} service - Auth service implementation
 */
const setAuthService = (service) => {
  authService = service;
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const login = async (req, res, next) => {
  try {
    if (!authService) {
      throw createError('INTERNAL_ERROR', 'Auth service not initialized');
    }
    
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      throw createError(
        'VALIDATION_ERROR',
        'Email and password are required',
        { email: !email ? 'Email is required' : null, 
          password: !password ? 'Password is required' : null }
      );
    }
    
    // Authenticate user
    const result = await authService.authenticate(email, password);
    
    // Return token and user data
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Register new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const register = async (req, res, next) => {
  try {
    if (!authService) {
      throw createError('INTERNAL_ERROR', 'Auth service not initialized');
    }
    
    const { firstName, lastName, email, password } = req.body;
    
    // Validate input
    const validationErrors = {};
    if (!firstName) validationErrors.firstName = 'First name is required';
    if (!lastName) validationErrors.lastName = 'Last name is required';
    if (!email) validationErrors.email = 'Email is required';
    if (!password) validationErrors.password = 'Password is required';
    
    if (Object.keys(validationErrors).length > 0) {
      throw createError(
        'VALIDATION_ERROR',
        'Invalid registration data',
        validationErrors
      );
    }
    
    // Register user
    const result = await authService.register({
      firstName,
      lastName,
      email,
      password
    });
    
    // Return token and user data
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getCurrentUser = async (req, res, next) => {
  try {
    // User data is already attached to request by auth middleware
    if (!req.user) {
      throw createError('AUTHENTICATION_ERROR', 'Not authenticated');
    }
    
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh authentication token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const refreshToken = async (req, res, next) => {
  try {
    if (!authService) {
      throw createError('INTERNAL_ERROR', 'Auth service not initialized');
    }
    
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw createError('VALIDATION_ERROR', 'Refresh token is required');
    }
    
    // Use the auth service to refresh the token
    const result = await authService.refreshAccessToken(refreshToken);
    
    // Return new token
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setAuthService,
  login,
  register,
  getCurrentUser,
  refreshToken
}; 