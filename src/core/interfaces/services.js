/**
 * Service Interfaces
 * These interfaces define the contracts for service layer components
 */

/**
 * Authentication Service Interface
 */
class AuthServiceInterface {
  /**
   * Authenticate a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Auth token and user data
   */
  async authenticate(email, password) {
    throw new Error('Method not implemented');
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Created user data
   */
  async register(userData) {
    throw new Error('Method not implemented');
  }

  /**
   * Verify an authentication token
   * @param {string} token - Auth token
   * @returns {Promise<Object|null>} - Decoded token data or null if invalid
   */
  async verifyToken(token) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Generate a new authentication token
   * @param {Object} payload - Token payload
   * @returns {Promise<string>} - Generated token
   */
  async generateToken(payload) {
    throw new Error('Method not implemented');
  }

  /**
   * Generate a refresh token
   * @param {Object} payload - Token payload
   * @returns {Promise<string>} - Generated refresh token
   */
  async generateRefreshToken(payload) {
    throw new Error('Method not implemented');
  }

  /**
   * Verify a refresh token
   * @param {string} token - Refresh token
   * @returns {Promise<Object|null>} - Decoded token data or null if invalid
   */
  async verifyRefreshToken(token) {
    throw new Error('Method not implemented');
  }

  /**
   * Refresh an access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - New access token and user data
   */
  async refreshAccessToken(refreshToken) {
    throw new Error('Method not implemented');
  }
}

/**
 * Lead Service Interface
 */
class LeadServiceInterface {
  /**
   * Create a new lead
   * @param {Object} leadData - Lead data
   * @returns {Promise<Object>} - Created lead
   */
  async createLead(leadData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update lead status
   * @param {string|number} leadId - Lead ID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated lead
   */
  async updateStatus(leadId, status) {
    throw new Error('Method not implemented');
  }

  /**
   * Assign lead to user
   * @param {string|number} leadId - Lead ID
   * @param {string|number} userId - User ID
   * @returns {Promise<Object>} - Updated lead
   */
  async assignLead(leadId, userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get leads by status
   * @param {string} status - Lead status
   * @returns {Promise<Array>} - Array of leads
   */
  async getLeadsByStatus(status) {
    throw new Error('Method not implemented');
  }
}

/**
 * Appointment Service Interface
 */
class AppointmentServiceInterface {
  /**
   * Schedule a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Object>} - Created appointment
   */
  async scheduleAppointment(appointmentData) {
    throw new Error('Method not implemented');
  }

  /**
   * Check availability for a time slot
   * @param {Date} date - Appointment date
   * @param {string} timeSlot - Time slot
   * @returns {Promise<boolean>} - True if available
   */
  async checkAvailability(date, timeSlot) {
    throw new Error('Method not implemented');
  }

  /**
   * Reschedule an appointment
   * @param {string|number} appointmentId - Appointment ID
   * @param {Date} newDate - New date
   * @param {string} newTimeSlot - New time slot
   * @returns {Promise<Object>} - Updated appointment
   */
  async rescheduleAppointment(appointmentId, newDate, newTimeSlot) {
    throw new Error('Method not implemented');
  }

  /**
   * Cancel an appointment
   * @param {string|number} appointmentId - Appointment ID
   * @returns {Promise<boolean>} - Success flag
   */
  async cancelAppointment(appointmentId) {
    throw new Error('Method not implemented');
  }
}

/**
 * Form Service Interface
 */
class FormServiceInterface {
  /**
   * Process form submission
   * @param {string} formType - Form type
   * @param {Object} formData - Form data
   * @returns {Promise<Object>} - Processing result
   */
  async processFormSubmission(formType, formData) {
    throw new Error('Method not implemented');
  }

  /**
   * Validate form data
   * @param {string} formType - Form type
   * @param {Object} formData - Form data
   * @returns {Promise<Object>} - Validation result with errors if any
   */
  async validateForm(formType, formData) {
    throw new Error('Method not implemented');
  }

  /**
   * Get form configuration
   * @param {string} formType - Form type
   * @returns {Promise<Object>} - Form configuration
   */
  async getFormConfig(formType) {
    throw new Error('Method not implemented');
  }
}

/**
 * Analytics Service Interface
 */
class AnalyticsServiceInterface {
  /**
   * Track page view
   * @param {Object} pageData - Page view data
   * @returns {Promise<void>}
   */
  async trackPageView(pageData) {
    throw new Error('Method not implemented');
  }

  /**
   * Track event
   * @param {string} eventType - Event type
   * @param {Object} eventData - Event data
   * @returns {Promise<void>}
   */
  async trackEvent(eventType, eventData) {
    throw new Error('Method not implemented');
  }

  /**
   * Generate analytics report
   * @param {string} reportType - Report type
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} - Report data
   */
  async generateReport(reportType, params) {
    throw new Error('Method not implemented');
  }
}

module.exports = {
  AuthServiceInterface,
  LeadServiceInterface,
  AppointmentServiceInterface,
  FormServiceInterface,
  AnalyticsServiceInterface
}; 