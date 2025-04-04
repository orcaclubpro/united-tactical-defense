/**
 * Main Application File
 * Initializes the Express server with clean architecture
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Import configuration
const config = require('./config/app');
const { initDatabase, runMigrations, getDatabase } = require('./config/database');
const { initRedisClient } = require('./config/redis');

// Import middleware
const requestLogger = require('./api/middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./api/middleware/errorHandler');
const { setAuthService, authenticate, authorize } = require('./api/middleware/auth');
const { sanitizeData } = require('./api/middleware/validators');
const createEventTrackingMiddleware = require('./api/middleware/eventTrackingMiddleware');
const rateLimiter = require('./api/middleware/rateLimiter');
const cache = require('./api/middleware/cache');

// Import routes
const authRoutes = require('./api/routes/authRoutes');
const leadRoutes = require('./api/routes/leadRoutes');
const appointmentRoutes = require('./api/routes/appointmentRoutes');
const formRoutes = require('./api/routes/formRoutes');
const setupAnalyticsRoutes = require('./api/routes/analyticsRoutes');

// Import repositories
const UserRepository = require('./data/repositories/userRepository');
const LeadRepository = require('./data/repositories/leadRepository');
const appointmentRepository = require('./data/repositories/appointmentRepository');
const formRepository = require('./data/repositories/formRepository');
const AnalyticsRepository = require('./data/repositories/analyticsRepository');

// Import services
const AuthService = require('./services/auth/authService');
const LeadService = require('./services/lead/leadService');
const appointmentService = require('./services/appointment/appointmentService');
const { initFormService, getFormService } = require('./services/form');
const AnalyticsService = require('./services/analytics/analyticsService');
const EventEmitter = require('./services/event/eventEmitter');
const FormAnalyticsSubscriber = require('./services/analytics/formAnalyticsSubscriber');
const RealTimeAnalyticsService = require('./services/analytics/realTimeAnalyticsService');

// Import controllers
const AnalyticsController = require('./api/controllers/analyticsController');

/**
 * Initialize the application
 * @returns {Object} Express application
 */
const initializeApp = async () => {
  // Initialize database
  await initDatabase();
  
  // Run migrations
  await runMigrations();
  
  // Initialize Redis if enabled
  await initRedisClient();
  
  const db = getDatabase();
  
  // Initialize repositories
  const userRepository = new UserRepository(db);
  const leadRepository = new LeadRepository(db);
  const analyticsRepository = new AnalyticsRepository(db);
  
  // Initialize services
  const authService = new AuthService(userRepository, {
    jwtSecret: config.jwtSecret,
    jwtExpiresIn: config.jwtExpiresIn
  });
  
  const leadService = new LeadService(leadRepository);
  
  const analyticsService = new AnalyticsService(analyticsRepository, {
    enableTracking: config.analyticsEnabled !== false,
    sampleRate: config.analyticsSampleRate || 1.0,
    retentionDays: config.analyticsRetentionDays || 90
  });
  
  // Initialize event system
  const eventEmitter = new EventEmitter();
  
  // Initialize form service with event emitter
  const formService = initFormService({ eventEmitter });
  
  // Initialize real-time analytics service
  const realTimeAnalyticsService = new RealTimeAnalyticsService(
    analyticsRepository, 
    eventEmitter, 
    {
      aggregationInterval: config.realTimeAnalyticsAggregationInterval || 60000, // 1 minute
      persistInterval: config.realTimeAnalyticsPersistInterval || 300000, // 5 minutes
      enableDebugLogging: config.nodeEnv === 'development'
    }
  );
  
  // Register subscribers
  const formAnalyticsSubscriber = new FormAnalyticsSubscriber(analyticsService);
  formAnalyticsSubscriber.subscribe(eventEmitter);
  
  // Initialize controllers
  const analyticsController = new AnalyticsController(analyticsService);
  analyticsController.setRealTimeAnalyticsService(realTimeAnalyticsService);
  
  // Set services in middleware
  setAuthService(authService);
  
  // Set services in controllers
  require('./api/controllers/authController').setAuthService(authService);
  require('./api/controllers/leadController').setLeadService(leadService);
  
  // Initialize Express app
  const app = express();
  
  // Global middleware
  app.use(cors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID']
  }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(sanitizeData);
  app.use(requestLogger({
    logRequestBody: config.nodeEnv === 'development',
    logResponseBody: config.nodeEnv === 'development',
    excludePaths: ['/api/health', '/api/metrics', '/api/analytics/pageview', '/api/analytics/event']
  }));
  
  // Event tracking middleware
  app.use(createEventTrackingMiddleware(eventEmitter));

  // Global rate limiting - protect against brute force attacks
  app.use(rateLimiter.default);
  
  // API Routes with specific rate limiting and caching
  app.use('/api/auth', rateLimiter.auth, authRoutes);
  
  // Apply caching to read-only endpoints
  app.use('/api/leads', rateLimiter.api, (req, res, next) => {
    if (req.method === 'GET') {
      cache.medium(req, res, next);
    } else {
      next();
    }
  }, leadRoutes);
  
  app.use('/api/appointments', rateLimiter.api, (req, res, next) => {
    if (req.method === 'GET') {
      cache.short(req, res, next);
    } else {
      next();
    }
  }, appointmentRoutes);
  
  app.use('/api/forms', rateLimiter.api, (req, res, next) => {
    // Cache form configurations longer as they rarely change
    if (req.method === 'GET' && req.path.startsWith('/config/')) {
      cache.long(req, res, next);
    } else {
      next();
    }
  }, formRoutes);
  
  // Apply short cache for analytics routes that are read-only
  app.use('/api/analytics', rateLimiter.api, (req, res, next) => {
    if (req.method === 'GET' && !req.path.includes('/realtime/')) {
      cache.short(req, res, next);
    } else {
      next();
    }
  }, setupAnalyticsRoutes(analyticsController));
  
  // Cache health and status endpoints for 5 seconds
  app.get('/api/health', cache.short, (req, res) => {
    res.json({ status: 'ok', environment: config.nodeEnv });
  });
  
  app.get('/api/status', cache.short, (req, res) => {
    res.json({ 
      status: 'online', 
      version: '1.0.0',
      environment: config.nodeEnv,
      timestamp: new Date().toISOString()
    });
  });
  
  // Serve static frontend files in production
  if (config.serveStaticFiles && config.nodeEnv === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    
    // Serve frontend for all non-API routes
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
      }
    });
  }
  
  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);
  
  return app;
};

module.exports = initializeApp; 