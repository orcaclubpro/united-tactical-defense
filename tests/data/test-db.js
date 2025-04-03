const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'unitedDT.db');
console.log(`Attempting to connect to database at: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  } else {
    console.log('Successfully connected to the unitedDT database.');
  }
});

// Query leads table
db.all('SELECT * FROM leads LIMIT 10', [], (err, rows) => {
  if (err) {
    console.error('Error querying leads table:', err.message);
  } else {
    console.log('Leads table data:');
    console.log(rows);
  }
  
  // Query page_visits table
  db.all('SELECT * FROM page_visits LIMIT 10', [], (err, rows) => {
    if (err) {
      console.error('Error querying page_visits table:', err.message);
    } else {
      console.log('Page visits table data:');
      console.log(rows);
    }
    
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  });
}); 