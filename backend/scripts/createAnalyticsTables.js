const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../../unitedDT.db');

// Connect to the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  console.log('Connected to the database.');
  
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  // Create page_visits table
  db.run(`
    CREATE TABLE IF NOT EXISTS page_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_url TEXT NOT NULL,
      referrer TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      user_agent TEXT,
      ip_address TEXT,
      visit_time DATETIME NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating page_visits table:', err.message);
      return;
    }
    console.log('page_visits table created or already exists');
    
    // Create page_engagement table
    db.run(`
      CREATE TABLE IF NOT EXISTS page_engagement (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visit_id INTEGER NOT NULL,
        time_on_page INTEGER,
        scroll_depth INTEGER,
        click_count INTEGER,
        form_interactions INTEGER,
        engagement_time DATETIME NOT NULL,
        FOREIGN KEY (visit_id) REFERENCES page_visits (id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating page_engagement table:', err.message);
        return;
      }
      console.log('page_engagement table created or already exists');
      
      // Create conversions table
      db.run(`
        CREATE TABLE IF NOT EXISTS conversions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          visit_id INTEGER NOT NULL,
          conversion_type TEXT NOT NULL,
          conversion_value REAL,
          conversion_data TEXT,
          conversion_time DATETIME NOT NULL,
          FOREIGN KEY (visit_id) REFERENCES page_visits (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating conversions table:', err.message);
          return;
        }
        console.log('conversions table created or already exists');
        
        // Create indexes for better query performance
        db.serialize(() => {
          db.run(`CREATE INDEX IF NOT EXISTS idx_page_visits_utm ON page_visits(utm_source, utm_medium, utm_campaign)`);
          db.run(`CREATE INDEX IF NOT EXISTS idx_page_visits_time ON page_visits(visit_time)`);
          db.run(`CREATE INDEX IF NOT EXISTS idx_page_engagement_visit ON page_engagement(visit_id)`);
          db.run(`CREATE INDEX IF NOT EXISTS idx_conversions_visit ON conversions(visit_id)`);
          db.run(`CREATE INDEX IF NOT EXISTS idx_conversions_type ON conversions(conversion_type)`);
          
          console.log('Indexes created successfully');
          console.log('Analytics tables setup complete');
          
          // Close the database connection
          db.close((err) => {
            if (err) {
              console.error('Error closing database connection:', err.message);
              return;
            }
            console.log('Database connection closed.');
          });
        });
      });
    });
  });
}); 