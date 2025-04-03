/**
 * Repository Interfaces
 * These interfaces define the contracts for data access layer repositories
 */

/**
 * Base Repository Interface
 * Defines common CRUD operations for all repositories
 */
class BaseRepository {
  /**
   * Find entity by ID
   * @param {string|number} id - Entity ID
   * @returns {Promise<Object|null>} - Entity or null if not found
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find all entities with optional filtering
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Array>} - Array of entities
   */
  async findAll(filter = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Create a new entity
   * @param {Object} data - Entity data
   * @returns {Promise<Object>} - Created entity
   */
  async create(data) {
    throw new Error('Method not implemented');
  }

  /**
   * Update an existing entity
   * @param {string|number} id - Entity ID
   * @param {Object} data - Updated entity data
   * @returns {Promise<Object>} - Updated entity
   */
  async update(id, data) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete an entity
   * @param {string|number} id - Entity ID
   * @returns {Promise<boolean>} - Success flag
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }
}

/**
 * User Repository Interface
 */
class UserRepositoryInterface extends BaseRepository {
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} - User or null if not found
   */
  async findByEmail(email) {
    throw new Error('Method not implemented');
  }
}

/**
 * Lead Repository Interface
 */
class LeadRepositoryInterface extends BaseRepository {
  /**
   * Find leads by status
   * @param {string} status - Lead status
   * @returns {Promise<Array>} - Array of leads
   */
  async findByStatus(status) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Assign lead to a user
   * @param {string|number} leadId - Lead ID
   * @param {string|number} userId - User ID
   * @returns {Promise<Object>} - Updated lead
   */
  async assignTo(leadId, userId) {
    throw new Error('Method not implemented');
  }
}

/**
 * Appointment Repository Interface
 */
class AppointmentRepositoryInterface extends BaseRepository {
  /**
   * Find appointments by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} - Array of appointments
   */
  async findByDateRange(startDate, endDate) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Find appointments by user
   * @param {string|number} userId - User ID
   * @returns {Promise<Array>} - Array of appointments
   */
  async findByUser(userId) {
    throw new Error('Method not implemented');
  }
}

/**
 * Form Repository Interface
 */
class FormRepositoryInterface extends BaseRepository {
  /**
   * Find forms by type
   * @param {string} formType - Form type
   * @returns {Promise<Array>} - Array of forms
   */
  async findByType(formType) {
    throw new Error('Method not implemented');
  }
}

/**
 * Analytics Repository Interface
 */
class AnalyticsRepositoryInterface extends BaseRepository {
  /**
   * Find analytics by type
   * @param {string} type - Analytics type (event or pageView)
   * @returns {Promise<Array>} - Array of analytics entries
   */
  async findByType(type) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Find events by event type
   * @param {string} eventType - Event type
   * @returns {Promise<Array>} - Array of events
   */
  async findByEventType(eventType) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Find analytics by user
   * @param {string|number} userId - User ID
   * @returns {Promise<Array>} - Array of analytics entries
   */
  async findByUser(userId) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Find analytics by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} - Array of analytics entries
   */
  async findByDateRange(startDate, endDate) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get user activity report
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string|number} userId - Optional user ID to filter by
   * @param {number} limit - Optional result limit
   * @returns {Promise<Object>} - Report data
   */
  async getUserActivityReport(startDate, endDate, userId, limit) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get page views report
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} groupBy - Group by field (path, referrer, day, etc.)
   * @param {number} limit - Optional result limit
   * @returns {Promise<Object>} - Report data
   */
  async getPageViewsReport(startDate, endDate, groupBy, limit) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get events report
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} eventType - Optional event type to filter by
   * @param {string} groupBy - Group by field (eventType, day, etc.)
   * @param {number} limit - Optional result limit
   * @returns {Promise<Object>} - Report data
   */
  async getEventsReport(startDate, endDate, eventType, groupBy, limit) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get conversion report
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} conversionGoal - Conversion goal event type
   * @param {number} limit - Optional result limit
   * @returns {Promise<Object>} - Report data
   */
  async getConversionReport(startDate, endDate, conversionGoal, limit) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Delete analytics older than specified date
   * @param {Date} date - Date threshold
   * @returns {Promise<number>} - Number of deleted records
   */
  async deleteOlderThan(date) {
    throw new Error('Method not implemented');
  }
}

module.exports = {
  BaseRepository,
  UserRepositoryInterface,
  LeadRepositoryInterface,
  AppointmentRepositoryInterface,
  FormRepositoryInterface,
  AnalyticsRepositoryInterface
}; 