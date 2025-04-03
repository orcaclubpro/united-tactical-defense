/**
 * User Entity
 * Core domain model for user data
 */

class User {
  /**
   * Create a new User instance
   * @param {Object} data - User data
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.password = data.password || ''; // Hashed password
    this.role = data.role || 'user';
    this.createdAt = data.createdAt instanceof Date 
      ? data.createdAt 
      : data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt instanceof Date 
      ? data.updatedAt 
      : data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  /**
   * Get full name
   * @returns {string}
   */
  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Is admin user
   * @returns {boolean}
   */
  get isAdmin() {
    return this.role === 'admin';
  }

  /**
   * Validate user data
   * @returns {Object} - Validation result with errors
   */
  validate() {
    const errors = {};

    if (!this.firstName) {
      errors.firstName = 'First name is required';
    }

    if (!this.lastName) {
      errors.lastName = 'Last name is required';
    }

    if (!this.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(this.email)) {
      errors.email = 'Email is invalid';
    }

    if (!this.password && !this.id) {
      errors.password = 'Password is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Convert to plain object
   * @returns {Object}
   */
  toJSON() {
    const json = {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
      fullName: this.fullName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };

    // Include password for internal operations but not for API responses
    // This should be explicitly managed when sending to client
    if (this.password) {
      json.password = this.password;
    }

    return json;
  }
}

module.exports = User; 