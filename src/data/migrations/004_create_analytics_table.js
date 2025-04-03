/**
 * Create analytics table migration
 */
module.exports = {
  /**
   * Run the migration
   * @param {Object} db - Database connection
   * @returns {Promise<void>}
   */
  up: (db) => {
    return new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          eventType TEXT,
          userId INTEGER,
          sessionId TEXT,
          data TEXT,
          ipAddress TEXT,
          userAgent TEXT,
          timestamp TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
        )
      `, (err) => {
        if (err) return reject(err);
        
        // Create indexes for better query performance
        db.run(`
          CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(type)
        `, (err) => {
          if (err) return reject(err);
          
          db.run(`
            CREATE INDEX IF NOT EXISTS idx_analytics_eventType ON analytics(eventType)
          `, (err) => {
            if (err) return reject(err);
            
            db.run(`
              CREATE INDEX IF NOT EXISTS idx_analytics_userId ON analytics(userId)
            `, (err) => {
              if (err) return reject(err);
              
              db.run(`
                CREATE INDEX IF NOT EXISTS idx_analytics_sessionId ON analytics(sessionId)
              `, (err) => {
                if (err) return reject(err);
                
                db.run(`
                  CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp)
                `, (err) => {
                  if (err) return reject(err);
                  resolve();
                });
              });
            });
          });
        });
      });
    });
  },
  
  /**
   * Rollback the migration
   * @param {Object} db - Database connection
   * @returns {Promise<void>}
   */
  down: (db) => {
    return new Promise((resolve, reject) => {
      // Drop indexes first
      db.run(`DROP INDEX IF EXISTS idx_analytics_timestamp`, (err) => {
        if (err) return reject(err);
        
        db.run(`DROP INDEX IF EXISTS idx_analytics_sessionId`, (err) => {
          if (err) return reject(err);
          
          db.run(`DROP INDEX IF EXISTS idx_analytics_userId`, (err) => {
            if (err) return reject(err);
            
            db.run(`DROP INDEX IF EXISTS idx_analytics_eventType`, (err) => {
              if (err) return reject(err);
              
              db.run(`DROP INDEX IF EXISTS idx_analytics_type`, (err) => {
                if (err) return reject(err);
                
                // Then drop the table
                db.run(`DROP TABLE IF EXISTS analytics`, (err) => {
                  if (err) return reject(err);
                  resolve();
                });
              });
            });
          });
        });
      });
    });
  }
}; 