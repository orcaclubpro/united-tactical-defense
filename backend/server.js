// Main server file for United Tactical Defense backend
const express = require('express');
const cors = require('cors');
const path = require('path');
const submitAppointmentRoutes = require('./routes/submit-appointment');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Initializing United Tactical Defense backend server...');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up CORS (in production, you would configure this with specific origins)
app.use(cors());
console.log('✅ CORS enabled - API accessible from frontend origin');

// Routes
app.use('/api/submit-appointment', submitAppointmentRoutes);
console.log('📡 Route registered: /api/submit-appointment');

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint for direct verification
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.status(200).json({ 
    message: 'Backend API is working correctly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✨ === United Defense Tactical Backend === ✨`);
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Appointment endpoint: http://localhost:${PORT}/api/submit-appointment`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`⏰ Server time: ${new Date().toLocaleString()}`);
  console.log(`🔄 Ready to receive requests from frontend (port 3000)`);
});

module.exports = app; // Export for testing