/**
 * Migration: Create Appointments Table
 */

/**
 * Up Migration - Creates the appointments table
 * @param {Object} db - Database connection
 * @returns {Promise<void>}
 */
exports.up = async (db) => {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      user_id INTEGER,
      date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      duration INTEGER DEFAULT 60,
      status TEXT NOT NULL DEFAULT 'scheduled',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    );
  `;

  try {
    // Create table
    await new Promise((resolve, reject) => {
      db.run(createTableSql, (err) => {
        if (err) return reject(err);
        console.log('✅ Appointments table created successfully');
        resolve();
      });
    });
    
    // Create indexes one by one
    await new Promise((resolve, reject) => {
      db.run('CREATE INDEX idx_appointments_lead_id ON appointments (lead_id);', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('CREATE INDEX idx_appointments_user_id ON appointments (user_id);', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('CREATE INDEX idx_appointments_date ON appointments (date);', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('CREATE INDEX idx_appointments_status ON appointments (status);', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    console.log('✅ Appointments indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating appointments table:', error);
    throw error;
  }
};

/**
 * Down Migration - Drops the appointments table
 * @param {Object} db - Database connection
 * @returns {Promise<void>}
 */
exports.down = async (db) => {
  const dropTableSql = 'DROP TABLE IF EXISTS appointments;';

  try {
    await new Promise((resolve, reject) => {
      db.run(dropTableSql, (err) => {
        if (err) return reject(err);
        console.log('✅ Appointments table dropped successfully');
        resolve();
      });
    });
  } catch (error) {
    console.error('❌ Error dropping appointments table:', error);
    throw error;
  }
}; 