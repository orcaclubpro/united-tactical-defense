/**
 * Auth Middleware
 * Re-exports the auth middleware functions for consistency
 */

const { authenticate, authorize, setAuthService } = require('./auth');

// Export the authenticate middleware as authMiddleware for backward compatibility
const authMiddleware = authenticate;

module.exports = {
  authMiddleware,
  authenticate,
  authorize,
  setAuthService
}; 