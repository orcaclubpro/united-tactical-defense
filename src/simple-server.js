/**
 * Simple Express Server for Testing
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

// Basic JSON parsing
app.use(express.json());

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Simple root endpoint
app.get('/', (req, res) => {
  res.send('United Tactical Defense API is running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
}); 