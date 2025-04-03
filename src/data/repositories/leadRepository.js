/**
 * Lead Repository
 * Data access implementation for leads
 */

const { LeadRepositoryInterface } = require('../../core/interfaces/repositories');
const Lead = require('../../core/entities/lead');

class LeadRepository extends LeadRepositoryInterface {
  /**
   * Initialize repository with database connection
   * @param {Object} db - Database connection
   */
  constructor(db) {
    super();
    this.db = db;
    this.collection = 'leads';
  }

  /**
   * Find lead by ID
   * @param {string|number} id - Lead ID
   * @returns {Promise<Lead|null>} - Lead or null if not found
   */
  async findById(id) {
    try {
      const query = 'SELECT * FROM leads WHERE id = ?';
      const result = await this.db.get(query, [id]);
      
      if (!result) {
        return null;
      }
      
      return new Lead(result);
    } catch (error) {
      console.error('Error finding lead by ID:', error);
      throw new Error('Failed to find lead');
    }
  }

  /**
   * Find all leads with optional filtering
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Array<Lead>>} - Array of leads
   */
  async findAll(filter = {}) {
    try {
      let query = 'SELECT * FROM leads WHERE 1=1';
      const params = [];
      
      if (filter.status) {
        query += ' AND status = ?';
        params.push(filter.status);
      }
      
      if (filter.assignedTo) {
        query += ' AND assigned_to = ?';
        params.push(filter.assignedTo);
      }
      
      if (filter.source) {
        query += ' AND source = ?';
        params.push(filter.source);
      }
      
      query += ' ORDER BY created_at DESC';
      
      if (filter.limit) {
        query += ' LIMIT ?';
        params.push(filter.limit);
      }
      
      if (filter.offset) {
        query += ' OFFSET ?';
        params.push(filter.offset);
      }
      
      const results = await this.db.all(query, params);
      return results.map(row => this.mapRowToLead(row));
    } catch (error) {
      console.error('Error finding leads:', error);
      throw new Error('Failed to find leads');
    }
  }

  /**
   * Create a new lead
   * @param {Object} data - Lead data
   * @returns {Promise<Lead>} - Created lead
   */
  async create(data) {
    try {
      const lead = new Lead(data);
      lead.validate();
      
      const now = new Date().toISOString();
      lead.createdAt = now;
      lead.updatedAt = now;
      
      const query = `
        INSERT INTO leads (
          first_name, last_name, email, phone_number,
          source, status, notes, assigned_to,
          interests, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        lead.firstName,
        lead.lastName,
        lead.email,
        lead.phoneNumber,
        lead.source,
        lead.status,
        lead.notes,
        lead.assignedTo,
        JSON.stringify(lead.interests),
        lead.createdAt,
        lead.updatedAt
      ];
      
      const result = await this.db.run(query, params);
      lead.id = result.lastID;
      
      return lead;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw new Error('Failed to create lead: ' + error.message);
    }
  }

  /**
   * Update an existing lead
   * @param {string|number} id - Lead ID
   * @param {Object} data - Updated lead data
   * @returns {Promise<Lead>} - Updated lead
   */
  async update(id, data) {
    try {
      const lead = await this.findById(id);
      if (!lead) {
        throw new Error('Lead not found');
      }
      
      // Update lead properties
      Object.assign(lead, data);
      lead.updatedAt = new Date().toISOString();
      
      const query = `
        UPDATE leads 
        SET first_name = ?, 
            last_name = ?, 
            email = ?, 
            phone_number = ?,
            source = ?, 
            status = ?, 
            notes = ?, 
            assigned_to = ?,
            interests = ?, 
            updated_at = ?
        WHERE id = ?
      `;
      
      const params = [
        lead.firstName,
        lead.lastName,
        lead.email,
        lead.phoneNumber,
        lead.source,
        lead.status,
        lead.notes,
        lead.assignedTo,
        JSON.stringify(lead.interests),
        lead.updatedAt,
        id
      ];
      
      await this.db.run(query, params);
      return lead;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw new Error('Failed to update lead: ' + error.message);
    }
  }

  /**
   * Delete a lead
   * @param {string|number} id - Lead ID
   * @returns {Promise<boolean>} - Success flag
   */
  async delete(id) {
    try {
      const lead = await this.findById(id);
      if (!lead) {
        throw new Error('Lead not found');
      }
      
      const query = 'DELETE FROM leads WHERE id = ?';
      await this.db.run(query, [id]);
      
      return true;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw new Error('Failed to delete lead: ' + error.message);
    }
  }

  /**
   * Find leads by status
   * @param {string} status - Lead status
   * @returns {Promise<Array<Lead>>} - Array of leads
   */
  async findByStatus(status) {
    return this.findAll({ status });
  }
  
  /**
   * Assign lead to a user
   * @param {string|number} leadId - Lead ID
   * @param {string|number} userId - User ID
   * @returns {Promise<Lead>} - Updated lead
   */
  async assignTo(leadId, userId) {
    try {
      const lead = await this.findById(leadId);
      if (!lead) {
        throw new Error('Lead not found');
      }
      
      lead.assignedTo = userId;
      lead.updatedAt = new Date().toISOString();
      
      const query = 'UPDATE leads SET assigned_to = ?, updated_at = ? WHERE id = ?';
      await this.db.run(query, [userId, lead.updatedAt, leadId]);
      
      return lead;
    } catch (error) {
      console.error('Error assigning lead:', error);
      throw new Error('Failed to assign lead: ' + error.message);
    }
  }

  /**
   * Map database row to Lead entity
   * @param {Object} row - Database row
   * @returns {Lead} - Lead entity
   * @private
   */
  mapRowToLead(row) {
    return new Lead({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phoneNumber: row.phone_number,
      source: row.source,
      status: row.status,
      notes: row.notes,
      assignedTo: row.assigned_to,
      interests: row.interests ? JSON.parse(row.interests) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }
}

module.exports = LeadRepository; 