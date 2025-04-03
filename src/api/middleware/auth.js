/**
 * Authentication Middleware
 * Handles authentication and authorization for API routes
 */

const jwt = require('jsonwebtoken');
const { AuthServiceInterface } = require('../../core/interfaces/services');

/**
 * Dependency Injection Container
 * Will be set during application bootstrap
 */
let authService = null;

/**
 * Set the authentication service implementation
 * @param {AuthServiceInterface} service - Auth service implementation
 */
const setAuthService = (service) => {
  if (!(service instanceof AuthServiceInterface)) {
    throw new Error('Invalid auth service implementation');
  }
  authService = service;
};

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    if (!authService) {
      throw new Error('Auth service not initialized');
    }

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication token is required' 
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid authentication token format' 
      });
    }

    // Verify token
    const decoded = await authService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or expired token' 
      });
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Authentication failed' 
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {string|string[]} roles - Allowed roles
 * @returns {Function} Middleware function
 */
const authorize = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'User not authenticated' 
        });
      }

      const userRole = req.user.role;
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: 'Insufficient permissions' 
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Authorization failed' 
      });
    }
  };
};

module.exports = {
  setAuthService,
  authenticate,
  authorize
}; 