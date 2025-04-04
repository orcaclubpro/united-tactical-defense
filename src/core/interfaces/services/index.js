/**
 * Service Interfaces
 * Defines interfaces for service implementations
 */

/**
 * Authentication Service Interface
 * Defines the contract for authentication services
 */
class AuthServiceInterface {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user
   */
  async register(userData) {
    throw new Error('Method not implemented');
  }

  /**
   * Authenticate a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication result with tokens
   */
  async login(email, password) {
    throw new Error('Method not implemented');
  }

  /**
   * Verify an authentication token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Decoded token payload
   */
  async verifyToken(token) {
    throw new Error('Method not implemented');
  }

  /**
   * Refresh authentication token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New authentication tokens
   */
  async refreshToken(refreshToken) {
    throw new Error('Method not implemented');
  }

  /**
   * Logout a user
   * @param {string} userId - User ID
   * @param {string} refreshToken - Refresh token to invalidate
   * @returns {Promise<boolean>} Success indicator
   */
  async logout(userId, refreshToken) {
    throw new Error('Method not implemented');
  }
}

module.exports = {
  AuthServiceInterface
}; 