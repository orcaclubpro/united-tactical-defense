/**
 * Migration: Create Users Table
 */

/**
 * Create the users table
 * @param {Object} db - Database connection
 * @returns {Promise<void>}
 */
exports.up = async (db) => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `, (err) => {
      if (err) return reject(err);
      
      // Add indexes
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
      `, (err) => {
        if (err) return reject(err);
        
        // Create initial admin user
        const hashedPassword = 'default.5d41402abc4b2a76b9719d911017c592'; // placeholder, will be properly hashed in production
        
        db.run(`
          INSERT INTO users (firstName, lastName, email, password, role, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          'Admin',
          'User',
          'admin@unitedtacticaldefense.com',
          hashedPassword,
          'admin',
          new Date().toISOString(),
          new Date().toISOString()
        ], (err) => {
          if (err) {
            // Ignore duplicate key error
            if (err.code !== 'SQLITE_CONSTRAINT') {
              return reject(err);
            }
          }
          resolve();
        });
      });
    });
  });
};

/**
 * Drop the users table
 * @param {Object} db - Database connection
 * @returns {Promise<void>}
 */
exports.down = async (db) => {
  return new Promise((resolve, reject) => {
    db.run(`DROP TABLE IF EXISTS users`, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}; 