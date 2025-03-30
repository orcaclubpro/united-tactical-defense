
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize express app
const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Create and initialize the database
const db = new sqlite3.Database('./unitedDT.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the unitedDT database.');

    // Create newLeads table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS newLeads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        source TEXT,
        potentialValue TEXT,
        appointmentTime TEXT,
        appointmentTitle TEXT,
        appointmentNotes TEXT,
        duration INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

// API endpoint to submit a new appointment
app.post('/api/appointments', (req, res) => {
  const { first_name, last_name, email, phone, appointment_date, appointment_time, lead_source, notes } = req.body;

  // Format the appointment time as ISO string
  const appointmentISO = new Date(`${appointment_date}T${appointment_time}`).toISOString();

  // Insert new appointment into database
  const query = `
    INSERT INTO newLeads (firstName, lastName, email, phone, appointmentTime, source, appointmentNotes, potentialValue, appointmentTitle, duration)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    first_name, 
    last_name, 
    email, 
    phone, 
    appointmentISO, 
    lead_source || 'Website Form', 
    notes || '',
    '$399', // Default potential value
    'Free Introductory Class', // Default appointment title
    60 // Default duration (60 minutes)
  ], function(err) {
    if (err) {
      console.error('Error inserting appointment:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to create appointment' });
    }

    console.log(`New appointment created with ID: ${this.lastID}`);
    return res.status(201).json({ 
      success: true, 
      message: 'Appointment created successfully',
      appointmentId: this.lastID
    });
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
