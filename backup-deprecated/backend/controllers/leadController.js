const { getDbConnection } = require('../config/database');

/**
 * Lead controller with methods for CRUD operations
 */
const leadController = {
  // Get all leads
  getAllLeads: (req, res, next) => {
    const db = getDbConnection();
    
    db.all('SELECT * FROM leads ORDER BY created_at DESC', [], (err, rows) => {
      db.close();
      
      if (err) {
        return next(err);
      }
      
      res.json({
        success: true,
        data: rows
      });
    });
  },
  
  // Get lead by ID
  getLeadById: (req, res, next) => {
    const { id } = req.params;
    const db = getDbConnection();
    
    db.get('SELECT * FROM leads WHERE id = ?', [id], (err, row) => {
      db.close();
      
      if (err) {
        return next(err);
      }
      
      if (!row) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Lead with ID ${id} not found`,
            code: 404
          }
        });
      }
      
      res.json({
        success: true,
        data: row
      });
    });
  },
  
  // Create new lead
  createLead: (req, res, next) => {
    const { firstName, lastName, email, phone, source, potentialValue, status } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'First name, last name, email, and phone are required',
          code: 400
        }
      });
    }
    
    const db = getDbConnection();
    
    const query = `
      INSERT INTO leads (firstName, lastName, email, phone, source, potentialValue, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
      firstName,
      lastName,
      email,
      phone,
      source || 'Website',
      potentialValue || '$0',
      status || 'new'
    ], function(err) {
      db.close();
      
      if (err) {
        return next(err);
      }
      
      res.status(201).json({
        success: true,
        data: {
          id: this.lastID,
          firstName,
          lastName,
          email,
          phone,
          source: source || 'Website',
          potentialValue: potentialValue || '$0',
          status: status || 'new'
        }
      });
    });
  },
  
  // Update lead
  updateLead: (req, res, next) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, source, potentialValue, status } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'First name, last name, email, and phone are required',
          code: 400
        }
      });
    }
    
    const db = getDbConnection();
    
    const query = `
      UPDATE leads 
      SET firstName = ?,
          lastName = ?,
          email = ?,
          phone = ?,
          source = ?,
          potentialValue = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    db.run(query, [
      firstName,
      lastName,
      email,
      phone,
      source || 'Website',
      potentialValue || '$0',
      status || 'new',
      id
    ], function(err) {
      if (err) {
        db.close();
        return next(err);
      }
      
      if (this.changes === 0) {
        db.close();
        return res.status(404).json({
          success: false,
          error: {
            message: `Lead with ID ${id} not found`,
            code: 404
          }
        });
      }
      
      // Get the updated record
      db.get('SELECT * FROM leads WHERE id = ?', [id], (err, row) => {
        db.close();
        
        if (err) {
          return next(err);
        }
        
        res.json({
          success: true,
          data: row
        });
      });
    });
  },
  
  // Delete lead
  deleteLead: (req, res, next) => {
    const { id } = req.params;
    const db = getDbConnection();
    
    db.run('DELETE FROM leads WHERE id = ?', [id], function(err) {
      db.close();
      
      if (err) {
        return next(err);
      }
      
      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Lead with ID ${id} not found`,
            code: 404
          }
        });
      }
      
      res.json({
        success: true,
        data: {
          id: parseInt(id),
          message: 'Lead deleted successfully'
        }
      });
    });
  }
};

module.exports = leadController; 