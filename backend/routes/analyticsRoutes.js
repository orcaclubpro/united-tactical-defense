const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

// Public routes for tracking (no auth required)
router.post('/track/visit', analyticsController.trackPageVisit);
router.post('/track/engagement', analyticsController.trackEngagement);
router.post('/track/conversion', analyticsController.trackConversion);
router.post('/track/landing-visit', analyticsController.trackLandingPageVisit);

// Protected routes for analytics reports (auth required)
router.get('/report', authMiddleware.requireAuth, analyticsController.getAnalyticsReport);
router.get('/landing-metrics', authMiddleware.requireAuth, analyticsController.getLandingPageMetrics);
router.get('/top-sources', authMiddleware.requireAuth, analyticsController.getTopTrafficSources);

module.exports = router; 