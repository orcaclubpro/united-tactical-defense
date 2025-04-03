const sqlite3 = require('sqlite3').verbose();

// Connect to the database
const db = new sqlite3.Database('./unitedDT.db', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to the database');
});

// Insert test data
const insertTestData = () => {
  const query = `
    INSERT INTO page_visits (
      page_url, 
      referrer, 
      utm_source, 
      utm_medium, 
      utm_campaign, 
      user_agent, 
      ip_address,
      is_landing_page,
      visit_time
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `;

  const params = [
    '/test-page',
    'direct',
    null,
    null,
    null,
    'test-user-agent',
    '127.0.0.1',
    1
  ];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Error inserting data:', err.message);
    } else {
      console.log(`Data inserted successfully with ID: ${this.lastID}`);
    }
    
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing the database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  });
};

// Execute the test
insertTestData(); 