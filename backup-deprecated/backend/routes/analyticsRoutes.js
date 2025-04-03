const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

// Public routes for tracking (no auth required)
router.post('/track/visit', analyticsController.trackPageVisit);
router.post('/track/engagement', analyticsController.trackEngagement);
router.post('/track/conversion', analyticsController.trackConversion);
router.post('/track/landing-visit', analyticsController.trackLandingPageVisit);

// Public test endpoint (no auth required) - for testing only
router.get('/reports/latest', analyticsController.getLatestMetricByReportType);

// Protected routes for analytics reports (auth required)
router.get('/report', authMiddleware.requireAuth, analyticsController.getAnalyticsReport);
router.get('/landing-metrics', authMiddleware.requireAuth, analyticsController.getLandingPageMetrics);
router.get('/top-sources', authMiddleware.requireAuth, analyticsController.getTopTrafficSources);
router.get('/devices', authMiddleware.requireAuth, analyticsController.getDeviceBreakdown);
router.get('/geo', authMiddleware.requireAuth, analyticsController.getGeographicDistribution);
router.get('/visitors', authMiddleware.requireAuth, analyticsController.getNewVsReturningMetrics);
router.get('/attribution', authMiddleware.requireAuth, analyticsController.getAttributionAnalysis);
router.get('/attribution/compare', authMiddleware.requireAuth, analyticsController.compareAttributionModels);
router.get('/insights', authMiddleware.requireAuth, analyticsController.getAnalyticsInsights);
router.get('/optimization', authMiddleware.requireAuth, analyticsController.getOptimizationSuggestions);

// New report endpoints
router.get('/metrics', authMiddleware.requireAuth, analyticsController.getMetricsByReportType);
router.get('/metrics/:reportType/latest', authMiddleware.requireAuth, analyticsController.getLatestMetricByReportType);
router.get('/traffic-sources/latest', authMiddleware.requireAuth, analyticsController.getLatestTrafficSources);
router.get('/conversion-rate-trend', authMiddleware.requireAuth, analyticsController.getConversionRateTrend);

module.exports = router; 