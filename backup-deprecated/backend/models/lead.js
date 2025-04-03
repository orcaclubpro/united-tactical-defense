const { getDbConnection } = require('../config/database');

class Lead {
  // Get all leads with optional filtering
  static getAll(filters = {}, limit = 100, offset = 0) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      
      let query = 'SELECT * FROM leads';
      const params = [];
      
      // Apply filters if provided
      if (Object.keys(filters).length > 0) {
        const whereConditions = [];
        
        for (const [key, value] of Object.entries(filters)) {
          whereConditions.push(`${key} = ?`);
          params.push(value);
        }
        
        query += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      // Add pagination
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      db.all(query, params, (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get lead by ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      
      db.get('SELECT * FROM leads WHERE id = ?', [id], (err, row) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Create a new lead
  static create(leadData) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      
      const {
        firstName,
        lastName,
        email,
        phone,
        source = 'Website Form',
        potentialValue = '$399',
        status = 'new'
      } = leadData;
      
      const query = `
        INSERT INTO leads (firstName, lastName, email, phone, source, potentialValue, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [firstName, lastName, email, phone, source, potentialValue, status], function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            ...leadData
          });
        }
      });
    });
  }

  // Update an existing lead
  static update(id, leadData) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      
      // Build update fields dynamically based on provided data
      const updateFields = [];
      const params = [];
      
      for (const [key, value] of Object.entries(leadData)) {
        updateFields.push(`${key} = ?`);
        params.push(value);
      }
      
      // Add updated_at timestamp
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      
      // Add ID to params
      params.push(id);
      
      const query = `
        UPDATE leads 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;
      
      db.run(query, params, function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({
            id,
            ...leadData,
            changes: this.changes
          });
        }
      });
    });
  }

  // Delete a lead
  static delete(id) {
    return new Promise((resolve, reject) => {
      const db = getDbConnection();
      
      db.run('DELETE FROM leads WHERE id = ?', [id], function(err) {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve({ 
            id, 
            deleted: this.changes > 0 
          });
        }
      });
    });
  }
}

module.exports = Lead; 