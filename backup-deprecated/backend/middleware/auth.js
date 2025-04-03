const jwt = require('jsonwebtoken');
const config = require('../config/app');

/**
 * Authentication middleware
 */
const authMiddleware = {
  /**
   * Verify JWT token and add user to request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  requireAuth: (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    // Check if no token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token, authorization denied' 
      });
    }
    
    // Verify token
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Add user to request
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid' 
      });
    }
  },
  
  /**
   * Optional authentication - doesn't require auth but will use it if provided
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  optionalAuth: (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    // If no token, continue as guest
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    
    // Verify token if provided
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Add user to request
      req.user = decoded;
      next();
    } catch (error) {
      // Continue as guest on invalid token
      req.user = null;
      next();
    }
  }
};

module.exports = authMiddleware; 