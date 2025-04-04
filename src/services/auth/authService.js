/**
 * Authentication Service
 * Handles user authentication operations
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AuthServiceInterface } = require('../../core/interfaces/services');
const { createError } = require('../../api/middleware/errorHandler');
const { User } = require('../../core/entities');

/**
 * AuthService implementation
 * @class AuthService
 * @extends AuthServiceInterface
 */
class AuthService extends AuthServiceInterface {
  /**
   * Constructor
   * @param {UserRepository} userRepository - User repository
   * @param {Object} options - Service options
   * @param {string} options.jwtSecret - JWT secret key
   * @param {string} options.jwtExpiresIn - JWT expiration time
   */
  constructor(userRepository, options = {}) {
    super();
    this.userRepository = userRepository;
    this.jwtSecret = options.jwtSecret || 'your-secret-key-change-in-production';
    this.jwtExpiresIn = options.jwtExpiresIn || '1d';
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user
   */
  async register(userData) {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with that email already exists');
    }

    // Create user and return without password
    const user = await this.userRepository.create(userData);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Authenticate a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication result with tokens
   */
  async login(email, password) {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Check password
    const isPasswordValid = await this.userRepository.validatePassword(user.id, password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user);

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Verify an authentication token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Decoded token payload
   */
  async verifyToken(token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, this.jwtSecret);
      
      // Check if user still exists and is active
      const user = await this.userRepository.findById(decoded.id);
      if (!user || !user.active) {
        throw new Error('User not found or inactive');
      }
      
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Refresh authentication token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New authentication tokens
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.jwtSecret);
      
      // Get user
      const user = await this.userRepository.findById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Generate new token
      const token = this.generateToken(user);
      
      return { token };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Logout a user
   * @param {string} userId - User ID
   * @param {string} refreshToken - Refresh token to invalidate
   * @returns {Promise<boolean>} Success indicator
   */
  async logout(userId, refreshToken) {
    // In a real implementation, we would invalidate the token
    // For a simple implementation, we just return success
    return true;
  }

  /**
   * Generate a JWT token for a user
   * @param {Object} user - User object
   * @returns {string} JWT token
   * @private
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role || 'user'
    };
    
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
  }

  /**
   * Hash a password
   * @param {string} password - Password to hash
   * @returns {Promise<string>} - Hashed password
   */
  async hashPassword(password) {
    return new Promise((resolve, reject) => {
      // Generate a random salt
      crypto.randomBytes(16, (err, salt) => {
        if (err) return reject(err);
        
        // Use PBKDF2 for password hashing
        crypto.pbkdf2(
          password, 
          salt, 
          10000, // iterations
          64,    // key length
          'sha512',
          (err, derivedKey) => {
            if (err) return reject(err);
            
            // Format: salt.hash
            resolve(`${salt.toString('hex')}.${derivedKey.toString('hex')}`);
          }
        );
      });
    });
  }

  /**
   * Verify a password against a hash
   * @param {string} password - Password to verify
   * @param {string} hash - Password hash
   * @returns {Promise<boolean>} - True if password matches
   */
  async verifyPassword(password, storedHash) {
    return new Promise((resolve, reject) => {
      try {
        // Split into salt and hash
        const [salt, hash] = storedHash.split('.');
        
        // Convert salt from hex string
        const saltBuffer = Buffer.from(salt, 'hex');
        
        // Use PBKDF2 to verify
        crypto.pbkdf2(
          password,
          saltBuffer,
          10000, // iterations (must match the one used for hashing)
          64,    // key length
          'sha512',
          (err, derivedKey) => {
            if (err) return reject(err);
            
            // Compare derived hash with stored hash
            resolve(derivedKey.toString('hex') === hash);
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Generate a new authentication token
   * @param {Object} payload - Token payload
   * @returns {Promise<string>} - Generated token
   */
  async generateToken(payload) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn },
        (err, token) => {
          if (err) return reject(err);
          resolve(token);
        }
      );
    });
  }

  /**
   * Generate a refresh token
   * @param {Object} payload - Token payload
   * @returns {Promise<string>} - Generated refresh token
   */
  async generateRefreshToken(payload) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        this.jwtSecret + '-refresh',
        { expiresIn: this.jwtExpiresIn },
        (err, token) => {
          if (err) return reject(err);
          resolve(token);
        }
      );
    });
  }

  /**
   * Verify a refresh token
   * @param {string} token - Refresh token
   * @returns {Promise<Object|null>} - Decoded token data or null if invalid
   */
  async verifyRefreshToken(token) {
    return new Promise((resolve) => {
      jwt.verify(token, this.jwtSecret + '-refresh', (err, decoded) => {
        if (err) {
          return resolve(null);
        }
        resolve(decoded);
      });
    });
  }

  /**
   * Refresh an access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - New access token and user data
   */
  async refreshAccessToken(refreshToken) {
    // Verify refresh token
    const decoded = await this.verifyRefreshToken(refreshToken);
    
    if (!decoded) {
      throw createError(
        'AUTHENTICATION_ERROR',
        'Invalid or expired refresh token'
      );
    }
    
    // Get user from database to ensure it still exists and is active
    const user = await this.userRepository.findById(decoded.id);
    
    if (!user) {
      throw createError(
        'AUTHENTICATION_ERROR',
        'User not found'
      );
    }
    
    // Generate new access token
    const accessToken = await this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // Return the new tokens
    return {
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    };
  }
}

module.exports = AuthService; 