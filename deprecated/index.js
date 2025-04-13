const express = require('express');
const cors = require('cors');
const appointmentRoutes = require('./routes/appointment');
const submitAppointmentRoutes = require('./routes/submit-appointment');
const db = require('./db');
const { logger, requestLogger } = require('./utils/logger');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3333;

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',') : 
    ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(requestLogger); // Add request logging middleware

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'United Tactical Defense API is running' });
});

// Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/submit-appointment', submitAppointmentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });
  
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Backend service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  // Close database connections
  db.close((err) => {
    if (err) {
      logger.error('Error closing database connection:', err);
    }
    logger.info('Database connection closed');
  });
  app.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', { reason, promise });
  process.exit(1);
});
