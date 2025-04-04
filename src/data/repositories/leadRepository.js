/**
 * Lead Repository
 * Data access implementation for leads
 */

const { LeadRepositoryInterface } = require('../../core/interfaces/repositories');
const Lead = require('../../core/entities/lead');
const { executeWithRetry, executeTransaction } = require('../../utils/dbErrorHandler');
const { getConnection, releaseConnection } = require('../../config/database');

class LeadRepository extends LeadRepositoryInterface {
  /**
   * Initialize repository with database connection
   * @param {Object} db - Database connection (legacy, kept for compatibility)
   */
  constructor(db) {
    super();
    this.db = db; // Kept for backward compatibility
    this.collection = 'leads';
  }

  /**
   * Find lead by ID
   * @param {string|number} id - Lead ID
   * @returns {Promise<Lead|null>} - Lead or null if not found
   */
  async findById(id) {
    return executeWithRetry(async (connection) => {
      return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM leads WHERE id = ?';
        connection.get(query, [id], (err, result) => {
          if (err) {
            return reject(err);
          }
          
          if (!result) {
            return resolve(null);
          }
          
          resolve(new Lead(result));
        });
      });
    });
  }

  /**
   * Find all leads with optional filtering
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Array<Lead>>} - Array of leads
   */
  async findAll(filter = {}) {
    return executeWithRetry(async (connection) => {
      return new Promise((resolve, reject) => {
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
        
        connection.all(query, params, (err, results) => {
          if (err) {
            return reject(err);
          }
          
          resolve(results.map(row => this.mapRowToLead(row)));
        });
      });
    });
  }

  /**
   * Create a new lead
   * @param {Object} data - Lead data
   * @returns {Promise<Lead>} - Created lead
   */
  async create(data) {
    return executeTransaction(async (connection) => {
      return new Promise((resolve, reject) => {
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
          
          connection.run(query, params, function(err) {
            if (err) {
              return reject(err);
            }
            
            lead.id = this.lastID;
            resolve(lead);
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Update an existing lead
   * @param {string|number} id - Lead ID
   * @param {Object} data - Updated lead data
   * @returns {Promise<Lead>} - Updated lead
   */
  async update(id, data) {
    return executeTransaction(async (connection) => {
      return new Promise(async (resolve, reject) => {
        try {
          // First retrieve the lead
          const leadResult = await new Promise((res, rej) => {
            connection.get('SELECT * FROM leads WHERE id = ?', [id], (err, row) => {
              if (err) return rej(err);
              res(row);
            });
          });
          
          if (!leadResult) {
            throw new Error('Lead not found');
          }
          
          const lead = new Lead(leadResult);
          
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
          
          connection.run(query, params, (err) => {
            if (err) {
              return reject(err);
            }
            
            resolve(lead);
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Delete a lead
   * @param {string|number} id - Lead ID
   * @returns {Promise<boolean>} - Success flag
   */
  async delete(id) {
    return executeTransaction(async (connection) => {
      return new Promise(async (resolve, reject) => {
        try {
          // First check if lead exists
          const lead = await new Promise((res, rej) => {
            connection.get('SELECT * FROM leads WHERE id = ?', [id], (err, row) => {
              if (err) return rej(err);
              res(row);
            });
          });
          
          if (!lead) {
            throw new Error('Lead not found');
          }
          
          // Then delete it
          connection.run('DELETE FROM leads WHERE id = ?', [id], (err) => {
            if (err) {
              return reject(err);
            }
            
            resolve(true);
          });
        } catch (error) {
          reject(error);
        }
      });
    });
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
    return executeTransaction(async (connection) => {
      return new Promise(async (resolve, reject) => {
        try {
          // First retrieve the lead
          const leadResult = await new Promise((res, rej) => {
            connection.get('SELECT * FROM leads WHERE id = ?', [leadId], (err, row) => {
              if (err) return rej(err);
              res(row);
            });
          });
          
          if (!leadResult) {
            throw new Error('Lead not found');
          }
          
          const lead = new Lead(leadResult);
          lead.assignedTo = userId;
          lead.updatedAt = new Date().toISOString();
          
          // Update the lead
          connection.run(
            'UPDATE leads SET assigned_to = ?, updated_at = ? WHERE id = ?',
            [userId, lead.updatedAt, leadId],
            (err) => {
              if (err) {
                return reject(err);
              }
              
              resolve(lead);
            }
          );
        } catch (error) {
          reject(error);
        }
      });
    });
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