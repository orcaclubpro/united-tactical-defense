const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const leadRoutes = require('./routes/leadRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const formRoutes = require('./routes/formRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Import middleware
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const analyticsInjector = require('./middleware/analyticsInjector');

// Import database
const { initDatabase } = require('./config/database');

// Import config
const config = require('./config/app');

// Import and initialize the metric tracking service
const metricTrackingService = require('./services/metricTrackingService');

// Initialize database
initDatabase();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve static frontend files in production
if (config.nodeEnv === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Add analytics script injector
app.use(analyticsInjector({
  apiEndpoint: '/api/analytics',
  trackScrollDepth: true,
  trackClicks: true,
  trackForms: true,
  sessionTimeout: 30,
  excludePaths: ['/admin', '/api']
}));

// API Routes
app.use('/api/leads', leadRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/form', formRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: config.nodeEnv });
});

// Serve frontend in production
if (config.nodeEnv === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || config.port;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start background metric tracking service
  metricTrackingService.start();
  console.log('Background metric tracking service started');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server gracefully...');
  
  // Stop the metric tracking service
  metricTrackingService.stop();
  console.log('Metric tracking service stopped');
  
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

module.exports = app; 