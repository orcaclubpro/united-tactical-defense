/**
 * Analytics Routes
 */

const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const Joi = require('joi');

/**
 * Setup analytics routes
 * @param {Object} analyticsController - Analytics controller
 * @returns {Object} - Express router
 */
function setupAnalyticsRoutes(analyticsController) {
  const router = express.Router();

  // Page view tracking - no auth required
  router.post(
    '/pageview',
    validate({
      body: Joi.object({
        path: Joi.string().required(),
        referrer: Joi.string().allow('', null),
        sessionId: Joi.string().allow('', null),
        deviceInfo: Joi.object().allow(null)
      })
    }),
    analyticsController.trackPageView.bind(analyticsController)
  );

  // Event tracking - no auth required
  router.post(
    '/event',
    validate({
      body: Joi.object({
        eventType: Joi.string().required(),
        sessionId: Joi.string().allow('', null),
        metadata: Joi.object().allow(null)
      })
    }),
    analyticsController.trackEvent.bind(analyticsController)
  );

  // Report generation - requires authentication
  router.get(
    '/reports/:reportType',
    authMiddleware,
    validate({
      params: Joi.object({
        reportType: Joi.string().valid('user_activity', 'page_views', 'events', 'conversion').required()
      }),
      query: Joi.object({
        startDate: Joi.string().required(),
        endDate: Joi.string().required(),
        userId: Joi.alternatives().try(Joi.number(), Joi.string()).allow(null),
        groupBy: Joi.string().allow('', null),
        limit: Joi.number().integer().min(1).max(1000).allow(null),
        conversionGoal: Joi.string().allow('', null),
        eventType: Joi.string().allow('', null)
      })
    }),
    analyticsController.generateReport.bind(analyticsController)
  );

  // Data cleanup - requires admin authentication
  router.delete(
    '/cleanup',
    authMiddleware,
    analyticsController.cleanupOldData.bind(analyticsController)
  );

  // Form analytics dashboard - requires authentication
  router.get(
    '/dashboard/forms',
    authMiddleware,
    validate({
      query: Joi.object({
        startDate: Joi.string().required(),
        endDate: Joi.string().required(),
        formType: Joi.string().allow('', null)
      })
    }),
    analyticsController.getFormAnalyticsDashboard.bind(analyticsController)
  );

  // Form conversion rates - requires authentication
  router.get(
    '/dashboard/form-conversions',
    authMiddleware,
    validate({
      query: Joi.object({
        startDate: Joi.string().required(),
        endDate: Joi.string().required(),
        formType: Joi.string().allow('', null),
        groupBy: Joi.string().valid('day', 'week', 'month').default('day')
      })
    }),
    analyticsController.getFormConversionRates.bind(analyticsController)
  );

  // Form submission time distribution - requires authentication
  router.get(
    '/dashboard/form-time-distribution',
    authMiddleware,
    validate({
      query: Joi.object({
        startDate: Joi.string().required(),
        endDate: Joi.string().required(),
        formType: Joi.string().allow('', null),
        interval: Joi.string().valid('hour', 'day', 'weekday').default('hour')
      })
    }),
    analyticsController.getFormSubmissionTimeDistribution.bind(analyticsController)
  );

  // Real-time form analytics - requires authentication
  router.get(
    '/realtime/forms',
    authMiddleware,
    analyticsController.getRealTimeFormAnalytics.bind(analyticsController)
  );

  // Reset real-time analytics stats - requires admin authentication
  router.post(
    '/realtime/reset',
    authMiddleware,
    analyticsController.resetRealTimeStats.bind(analyticsController)
  );

  return router;
}

module.exports = setupAnalyticsRoutes; 