/**
 * Migration: Create Leads Table
 */

/**
 * Execute the migration
 * @param {Object} db - Database connection
 * @returns {Promise<void>}
 */
const up = async (db) => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone_number TEXT,
      source TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      notes TEXT,
      assigned_to INTEGER,
      interests TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (assigned_to) REFERENCES users (id)
    )
  `;
  
  const createIndexQuery = `
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
    CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
  `;
  
  try {
    // Run create table as a proper promise
    await new Promise((resolve, reject) => {
      db.run(createTableQuery, (err) => {
        if (err) return reject(err);
        console.log('Leads table created successfully');
        resolve();
      });
    });
    
    // Run each index creation separately
    await new Promise((resolve, reject) => {
      db.run(`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run(`CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)`, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run(`CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to)`, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    console.log('Leads indexes created successfully');
  } catch (error) {
    console.error('Error creating leads table:', error);
    throw error;
  }
};

/**
 * Rollback the migration
 * @param {Object} db - Database connection
 * @returns {Promise<void>}
 */
const down = async (db) => {
  const dropTableQuery = 'DROP TABLE IF EXISTS leads';
  
  try {
    await new Promise((resolve, reject) => {
      db.run(dropTableQuery, (err) => {
        if (err) return reject(err);
        console.log('Leads table dropped successfully');
        resolve();
      });
    });
  } catch (error) {
    console.error('Error dropping leads table:', error);
    throw error;
  }
};

module.exports = {
  up,
  down
}; 