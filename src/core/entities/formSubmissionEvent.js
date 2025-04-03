/**
 * FormSubmissionEvent Entity
 * Represents a form submission event in the system
 * Enhanced with detailed payload structure for analytics integration
 */

class FormSubmissionEvent {
  /**
   * Constructor
   * @param {Object} data - Event data
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.formType = data.formType || '';
    this.formId = data.formId || null;
    this.userId = data.userId || null;
    this.sessionId = data.sessionId || '';
    this.formData = data.formData || {};
    this.metadata = data.metadata || {};
    this.ipAddress = data.ipAddress || '';
    this.userAgent = data.userAgent || '';
    this.referer = data.referer || '';
    this.status = data.status || 'submitted'; // submitted, processed, error, converted
    this.errorDetails = data.errorDetails || null;
    this.processingTime = data.processingTime || null;
    this.conversionData = data.conversionData || null; // data related to any conversion that resulted
    this.tags = data.tags || []; // Categorization tags for the event
    this.page = data.page || null; // Page where the form was submitted
    this.device = this._parseDevice(data.userAgent); // Detected device type
    this.geoLocation = data.geoLocation || null; // Geographic information if available
    this.timestamp = data.timestamp instanceof Date ? data.timestamp : new Date(data.timestamp || Date.now());
    this.createdAt = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt || Date.now());
    this.updatedAt = data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt || Date.now());
  }

  /**
   * Parse device information from user agent
   * @param {string} userAgent - Browser user agent string
   * @returns {Object} - Device information
   * @private
   */
  _parseDevice(userAgent) {
    if (!userAgent) return { type: 'unknown' };
    
    const ua = userAgent.toLowerCase();
    let deviceType = 'desktop';
    
    if (/(android|webos|iphone|ipad|ipod|blackberry|windows phone)/i.test(ua)) {
      deviceType = 'mobile';
      
      if (/(ipad|tablet)/i.test(ua)) {
        deviceType = 'tablet';
      }
    }
    
    return {
      type: deviceType,
      userAgent: userAgent
    };
  }

  /**
   * Update the event status
   * @param {string} status - New status
   * @param {Object} additionalData - Additional data to update
   * @returns {FormSubmissionEvent} - Updated event instance
   */
  updateStatus(status, additionalData = {}) {
    if (!['submitted', 'processed', 'error', 'converted'].includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    
    this.status = status;
    this.updatedAt = new Date();
    
    // Update additional fields if provided
    Object.keys(additionalData).forEach(key => {
      if (this.hasOwnProperty(key)) {
        this[key] = additionalData[key];
      }
    });
    
    return this;
  }

  /**
   * Mark event as converted
   * @param {Object} conversionData - Data about the conversion
   * @returns {FormSubmissionEvent} - Updated event instance
   */
  markAsConverted(conversionData) {
    this.status = 'converted';
    this.conversionData = conversionData;
    this.updatedAt = new Date();
    
    if (conversionData.timestamp) {
      const submissionTime = this.timestamp.getTime();
      const conversionTime = new Date(conversionData.timestamp).getTime();
      
      // Calculate time to conversion in milliseconds
      if (!isNaN(conversionTime) && !isNaN(submissionTime)) {
        this.metadata.timeToConversion = conversionTime - submissionTime;
      }
    }
    
    return this;
  }

  /**
   * Add tags to the event
   * @param {Array<string>} tags - Tags to add
   * @returns {FormSubmissionEvent} - Updated event instance
   */
  addTags(tags) {
    if (Array.isArray(tags)) {
      this.tags = [...new Set([...this.tags, ...tags])]; // Ensure uniqueness
    }
    return this;
  }

  /**
   * Validate the form submission event
   * @returns {Object} - Validation results with errors array
   */
  validate() {
    const errors = [];

    if (!this.formType) {
      errors.push('Form type is required');
    }

    if (this.status && !['submitted', 'processed', 'error', 'converted'].includes(this.status)) {
      errors.push('Status must be one of: submitted, processed, error, converted');
    }

    // Validate timestamp
    if (!(this.timestamp instanceof Date) || isNaN(this.timestamp.getTime())) {
      errors.push('Invalid timestamp');
    }

    // Validate session ID
    if (!this.sessionId) {
      errors.push('Session ID is required');
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
      formType: this.formType,
      formId: this.formId,
      userId: this.userId,
      sessionId: this.sessionId,
      formData: this.formData,
      metadata: this.metadata,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      referer: this.referer,
      status: this.status,
      errorDetails: this.errorDetails,
      processingTime: this.processingTime,
      conversionData: this.conversionData,
      tags: this.tags,
      page: this.page,
      device: this.device,
      geoLocation: this.geoLocation,
      timestamp: this.timestamp,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create from database record
   * @param {Object} record - Database record
   * @returns {FormSubmissionEvent} - New instance
   */
  static fromRecord(record) {
    return new FormSubmissionEvent({
      id: record.id,
      formType: record.form_type,
      formId: record.form_id,
      userId: record.user_id,
      sessionId: record.session_id,
      formData: record.form_data ? JSON.parse(record.form_data) : {},
      metadata: record.metadata ? JSON.parse(record.metadata) : {},
      ipAddress: record.ip_address,
      userAgent: record.user_agent,
      referer: record.referer,
      status: record.status,
      errorDetails: record.error_details ? JSON.parse(record.error_details) : null,
      processingTime: record.processing_time,
      conversionData: record.conversion_data ? JSON.parse(record.conversion_data) : null,
      tags: record.tags ? JSON.parse(record.tags) : [],
      page: record.page,
      geoLocation: record.geo_location ? JSON.parse(record.geo_location) : null,
      timestamp: record.timestamp,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    });
  }

  /**
   * Convert to database record
   * @returns {Object} - Database record fields
   */
  toRecord() {
    return {
      id: this.id,
      form_type: this.formType,
      form_id: this.formId,
      user_id: this.userId,
      session_id: this.sessionId,
      form_data: JSON.stringify(this.formData),
      metadata: JSON.stringify(this.metadata),
      ip_address: this.ipAddress,
      user_agent: this.userAgent,
      referer: this.referer,
      status: this.status,
      error_details: this.errorDetails ? JSON.stringify(this.errorDetails) : null,
      processing_time: this.processingTime,
      conversion_data: this.conversionData ? JSON.stringify(this.conversionData) : null,
      tags: JSON.stringify(this.tags),
      page: this.page,
      geo_location: this.geoLocation ? JSON.stringify(this.geoLocation) : null,
      timestamp: this.timestamp,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }
}

module.exports = FormSubmissionEvent; 