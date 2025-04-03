/**
 * Authentication Service Implementation
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AuthServiceInterface } = require('../../core/interfaces/services');
const { createError } = require('../../api/middleware/errorHandler');
const { User } = require('../../core/entities');

class AuthService extends AuthServiceInterface {
  /**
   * Constructor
   * @param {Object} userRepository - User repository
   * @param {Object} config - Configuration options
   */
  constructor(userRepository, config) {
    super();
    this.userRepository = userRepository;
    this.config = config || {
      jwtSecret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
      jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      saltRounds: 10
    };
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
   * Authenticate a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Auth token and user data
   */
  async authenticate(email, password) {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw createError(
        'AUTHENTICATION_ERROR',
        'Invalid email or password'
      );
    }
    
    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      throw createError(
        'AUTHENTICATION_ERROR',
        'Invalid email or password'
      );
    }
    
    // Generate access token
    const token = await this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // Generate refresh token
    const refreshToken = await this.generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // Return tokens and user data (without password)
    const { password: _, ...userData } = user.toJSON();
    
    return {
      token,
      refreshToken,
      user: userData
    };
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Created user data
   */
  async register(userData) {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    
    if (existingUser) {
      throw createError(
        'CONFLICT_ERROR',
        'User with this email already exists'
      );
    }
    
    // Hash password
    const hashedPassword = await this.hashPassword(userData.password);
    
    // Create user entity
    const user = new User({
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Save user to repository
    const createdUser = await this.userRepository.create(user);
    
    // Generate access token
    const token = await this.generateToken({
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role
    });
    
    // Generate refresh token
    const refreshToken = await this.generateRefreshToken({
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role
    });
    
    // Return tokens and user data (without password)
    const { password: _, ...createdUserData } = createdUser.toJSON();
    
    return {
      token,
      refreshToken,
      user: createdUserData
    };
  }

  /**
   * Verify an authentication token
   * @param {string} token - Auth token
   * @returns {Promise<Object|null>} - Decoded token data or null if invalid
   */
  async verifyToken(token) {
    return new Promise((resolve) => {
      jwt.verify(token, this.config.jwtSecret, (err, decoded) => {
        if (err) {
          return resolve(null);
        }
        resolve(decoded);
      });
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
        this.config.jwtSecret,
        { expiresIn: this.config.jwtExpiresIn },
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
        this.config.jwtSecret + '-refresh',
        { expiresIn: this.config.jwtRefreshExpiresIn },
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
      jwt.verify(token, this.config.jwtSecret + '-refresh', (err, decoded) => {
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