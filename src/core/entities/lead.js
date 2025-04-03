/**
 * Lead Entity
 * Core domain model for leads in the system
 */

class Lead {
  /**
   * Create a new lead entity
   * @param {Object} data - Lead data
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.phoneNumber = data.phoneNumber || '';
    this.source = data.source || '';
    this.status = data.status || 'new';
    this.notes = data.notes || '';
    this.assignedTo = data.assignedTo || null;
    this.interests = data.interests || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Get lead's full name
   * @returns {string} Full name
   */
  getFullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Check if lead has been assigned
   * @returns {boolean} True if assigned
   */
  isAssigned() {
    return !!this.assignedTo;
  }

  /**
   * Check if lead is in a specific status
   * @param {string} status - Status to check
   * @returns {boolean} True if lead is in the specified status
   */
  hasStatus(status) {
    return this.status === status;
  }

  /**
   * Check if lead is qualified
   * @returns {boolean} True if lead is qualified
   */
  isQualified() {
    return ['qualified', 'proposal', 'negotiation', 'won'].includes(this.status);
  }

  /**
   * Check if lead has converted
   * @returns {boolean} True if lead has converted
   */
  hasConverted() {
    return this.status === 'won';
  }

  /**
   * Assign lead to user
   * @param {string|number} userId - User ID
   */
  assignTo(userId) {
    this.assignedTo = userId;
    this.updatedAt = new Date();
  }

  /**
   * Update lead status
   * @param {string} status - New status
   */
  updateStatus(status) {
    const validStatuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid lead status');
    }
    this.status = status;
    this.updatedAt = new Date();
  }

  /**
   * Add a note to the lead
   * @param {string} note - Note content
   */
  addNote(note) {
    if (!note || typeof note !== 'string') {
      throw new Error('Note must be a non-empty string');
    }
    this.notes += this.notes ? `\n${note}` : note;
    this.updatedAt = new Date();
  }

  /**
   * Add an interest to the lead
   * @param {string} interest - Interest to add
   */
  addInterest(interest) {
    if (!this.interests.includes(interest)) {
      this.interests.push(interest);
      this.updatedAt = new Date();
    }
  }

  /**
   * Validate lead data
   * @returns {boolean} True if valid
   * @throws {Error} Validation error
   */
  validate() {
    if (!this.firstName) {
      throw new Error('First name is required');
    }
    if (!this.lastName) {
      throw new Error('Last name is required');
    }
    if (!this.email) {
      throw new Error('Email is required');
    }
    if (!this.source) {
      throw new Error('Lead source is required');
    }
    return true;
  }
}

module.exports = Lead; 