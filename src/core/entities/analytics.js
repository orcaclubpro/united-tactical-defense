/**
 * Analytics Entity
 * Represents an analytics event or page view
 */

class Analytics {
  /**
   * Constructor
   * @param {Object} data - Analytics data
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.type = data.type || 'event'; // event or pageView
    this.eventType = data.eventType || null; // for events only
    this.userId = data.userId || null;
    this.sessionId = data.sessionId || null;
    this.data = data.data || {};
    this.ipAddress = data.ipAddress || null;
    this.userAgent = data.userAgent || null;
    this.timestamp = data.timestamp instanceof Date ? data.timestamp : new Date(data.timestamp || Date.now());
    this.createdAt = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt || Date.now());
  }

  /**
   * Validate the analytics entry
   * @returns {Object} - Validation results with errors array
   */
  validate() {
    const errors = [];

    // Check required fields based on type
    if (!['event', 'pageView'].includes(this.type)) {
      errors.push('Type must be either "event" or "pageView"');
    }

    // For events, eventType is required
    if (this.type === 'event' && !this.eventType) {
      errors.push('Event type is required for event analytics');
    }

    // Validate timestamp
    if (!(this.timestamp instanceof Date) || isNaN(this.timestamp.getTime())) {
      errors.push('Invalid timestamp');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to plain object
   * @returns {Object} - Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      eventType: this.eventType,
      userId: this.userId,
      sessionId: this.sessionId,
      data: this.data,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      timestamp: this.timestamp,
      createdAt: this.createdAt
    };
  }
}

module.exports = Analytics; 