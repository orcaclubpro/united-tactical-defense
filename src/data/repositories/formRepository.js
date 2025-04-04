/**
 * Form Repository Implementation
 * Data access layer for forms
 */

const { FormRepositoryInterface } = require('../../core/interfaces/repositories');
const { Form } = require('../../core/entities');

class FormRepository extends FormRepositoryInterface {
  constructor(db) {
    super();
    this.db = db;
  }
  
  /**
   * Find form by ID
   * @param {string|number} id - Form ID
   * @returns {Promise<Form|null>} - Form entity or null if not found
   */
  async findById(id) {
    try {
      return new Promise((resolve, reject) => {
        this.db.get('SELECT * FROM forms WHERE id = ?', [id], (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(null);
          resolve(new Form(this._mapRowToEntity(row)));
        });
      });
    } catch (error) {
      console.error('Error in FormRepository.findById:', error);
      throw error;
    }
  }

  /**
   * Find all forms with optional filtering
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Array<Form>>} - Array of form entities
   */
  async findAll(filter = {}) {
    try {
      let query = 'SELECT * FROM forms';
      const params = [];
      const conditions = [];
      
      if (filter.type) {
        conditions.push('type = ?');
        params.push(filter.type);
      }
      
      if (filter.status) {
        conditions.push('status = ?');
        params.push(filter.status);
      }
      
      if (filter.fromDate) {
        conditions.push('submitted_at >= ?');
        params.push(filter.fromDate);
      }
      
      if (filter.toDate) {
        conditions.push('submitted_at <= ?');
        params.push(filter.toDate);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      if (filter.orderBy) {
        query += ` ORDER BY ${filter.orderBy} ${filter.order || 'ASC'}`;
      } else {
        query += ' ORDER BY submitted_at DESC';
      }
      
      if (filter.limit) {
        query += ' LIMIT ?';
        params.push(filter.limit);
        
        if (filter.offset) {
          query += ' OFFSET ?';
          params.push(filter.offset);
        }
      }
      
      return new Promise((resolve, reject) => {
        this.db.all(query, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows.map(row => new Form(this._mapRowToEntity(row))));
        });
      });
    } catch (error) {
      console.error('Error in FormRepository.findAll:', error);
      throw error;
    }
  }

  /**
   * Find forms by type
   * @param {string} formType - Form type
   * @returns {Promise<Array<Form>>} - Array of form entities
   */
  async findByType(formType) {
    try {
      return new Promise((resolve, reject) => {
        this.db.all(
          'SELECT * FROM forms WHERE type = ? ORDER BY submitted_at DESC',
          [formType],
          (err, rows) => {
            if (err) return reject(err);
            resolve(rows.map(row => new Form(this._mapRowToEntity(row))));
          }
        );
      });
    } catch (error) {
      console.error('Error in FormRepository.findByType:', error);
      throw error;
    }
  }

  /**
   * Create a new form
   * @param {Object} data - Form data
   * @returns {Promise<Form>} - Created form entity
   */
  async create(data) {
    try {
      const form = new Form(data);
      
      return new Promise((resolve, reject) => {
        this.db.run(
          `INSERT INTO forms (
            type, 
            fields, 
            validation_rules, 
            data, 
            submitted_at, 
            status,
            ip_address,
            user_agent
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            form.type,
            JSON.stringify(form.fields),
            JSON.stringify(form.validationRules),
            JSON.stringify(form.data),
            form.submittedAt,
            form.status,
            data.ipAddress || null,
            data.userAgent || null
          ],
          function(err) {
            if (err) return reject(err);
            resolve(this.lastID);
          }
        );
      }).then(insertId => this.findById(insertId));
    } catch (error) {
      console.error('Error in FormRepository.create:', error);
      throw error;
    }
  }

  /**
   * Update an existing form
   * @param {string|number} id - Form ID
   * @param {Object} data - Updated form data
   * @returns {Promise<Form>} - Updated form entity
   */
  async update(id, data) {
    try {
      const form = await this.findById(id);
      
      if (!form) {
        throw new Error(`Form with ID ${id} not found`);
      }
      
      const updatedData = {
        ...form,
        ...data,
        id
      };
      
      const updateFields = [];
      const updateParams = [];
      
      if (data.status !== undefined) {
        updateFields.push('status = ?');
        updateParams.push(data.status);
      }
      
      if (data.data !== undefined) {
        updateFields.push('data = ?');
        updateParams.push(JSON.stringify(data.data));
      }
      
      if (data.fields !== undefined) {
        updateFields.push('fields = ?');
        updateParams.push(JSON.stringify(data.fields));
      }
      
      if (data.validationRules !== undefined) {
        updateFields.push('validation_rules = ?');
        updateParams.push(JSON.stringify(data.validationRules));
      }
      
      if (data.processingResult !== undefined) {
        updateFields.push('processing_result = ?');
        updateParams.push(JSON.stringify(data.processingResult));
      }
      
      if (data.convertedTo !== undefined) {
        updateFields.push('converted_to = ?');
        updateParams.push(JSON.stringify(data.convertedTo));
      }
      
      if (updateFields.length === 0) {
        return form;
      }
      
      updateParams.push(id);
      
      await this.db.run(
        `UPDATE forms SET ${updateFields.join(', ')} WHERE id = ?`,
        updateParams
      );
      
      return this.findById(id);
    } catch (error) {
      console.error('Error in FormRepository.update:', error);
      throw error;
    }
  }

  /**
   * Delete a form
   * @param {string|number} id - Form ID
   * @returns {Promise<boolean>} - Success flag
   */
  async delete(id) {
    try {
      const result = await this.db.run(
        'DELETE FROM forms WHERE id = ?',
        [id]
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error in FormRepository.delete:', error);
      throw error;
    }
  }
  
  /**
   * Find forms that have been converted to a specific entity
   * @param {string} entityType - Entity type
   * @param {string|number} entityId - Entity ID
   * @returns {Promise<Array<Form>>} - Array of form entities
   */
  async findByConversion(entityType, entityId) {
    try {
      const results = await this.db.all(
        `SELECT * FROM forms 
         WHERE JSON_EXTRACT(converted_to, '$.entityType') = ? 
         AND JSON_EXTRACT(converted_to, '$.entityId') = ?`,
        [entityType, entityId.toString()]
      );
      
      return results.map(row => new Form(this._mapRowToEntity(row)));
    } catch (error) {
      console.error('Error in FormRepository.findByConversion:', error);
      throw error;
    }
  }
  
  /**
   * Map database row to entity object
   * @param {Object} row - Database row
   * @returns {Object} - Entity data
   * @private
   */
  _mapRowToEntity(row) {
    return {
      id: row.id,
      type: row.type,
      fields: JSON.parse(row.fields),
      validationRules: JSON.parse(row.validation_rules),
      data: JSON.parse(row.data),
      submittedAt: row.submitted_at,
      status: row.status,
      processingResult: row.processing_result ? JSON.parse(row.processing_result) : null,
      convertedTo: row.converted_to ? JSON.parse(row.converted_to) : null,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = FormRepository; 