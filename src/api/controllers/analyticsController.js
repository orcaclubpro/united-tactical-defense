/**
 * Analytics Controller
 */

const { createError } = require('../middleware/errorHandler');

class AnalyticsController {
  /**
   * Constructor
   * @param {Object} analyticsService - Analytics service
   */
  constructor(analyticsService) {
    this.analyticsService = analyticsService;
    this.realTimeAnalyticsService = null;
  }

  /**
   * Set real-time analytics service
   * @param {Object} realTimeAnalyticsService - Real-time analytics service
   */
  setRealTimeAnalyticsService(realTimeAnalyticsService) {
    this.realTimeAnalyticsService = realTimeAnalyticsService;
  }

  /**
   * Track page view
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async trackPageView(req, res, next) {
    try {
      const { path, referrer, deviceInfo } = req.body;
      const userId = req.user ? req.user.id : null;
      const sessionId = req.body.sessionId || req.headers['x-session-id'];
      
      if (!path) {
        return next(createError(
          'VALIDATION_ERROR',
          'Path is required for page view tracking'
        ));
      }
      
      const pageData = {
        userId,
        sessionId,
        path,
        referrer,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        deviceInfo,
        timestamp: new Date()
      };
      
      const result = await this.analyticsService.trackPageView(pageData);
      
      // Always return success even if tracking fails internally
      res.status(200).json({ success: true, tracked: !!result });
    } catch (error) {
      // Log the error but don't propagate to client
      console.error('Error tracking page view:', error);
      res.status(200).json({ success: true, tracked: false });
    }
  }

  /**
   * Track event
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async trackEvent(req, res, next) {
    try {
      const { eventType, metadata } = req.body;
      const userId = req.user ? req.user.id : null;
      const sessionId = req.body.sessionId || req.headers['x-session-id'];
      
      if (!eventType) {
        return next(createError(
          'VALIDATION_ERROR',
          'Event type is required for event tracking'
        ));
      }
      
      const eventData = {
        userId,
        sessionId,
        metadata,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        timestamp: new Date()
      };
      
      const result = await this.analyticsService.trackEvent(eventType, eventData);
      
      // Always return success even if tracking fails internally
      res.status(200).json({ success: true, tracked: !!result });
    } catch (error) {
      // Log the error but don't propagate to client
      console.error('Error tracking event:', error);
      res.status(200).json({ success: true, tracked: false });
    }
  }

  /**
   * Generate analytics report
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async generateReport(req, res, next) {
    try {
      // Require authentication for report generation
      if (!req.user) {
        return next(createError(
          'AUTHENTICATION_ERROR',
          'Authentication required to access reports'
        ));
      }
      
      // Check if user has permission to access reports
      if (!['admin', 'manager', 'analyst'].includes(req.user.role)) {
        return next(createError(
          'AUTHORIZATION_ERROR',
          'You do not have permission to access analytics reports'
        ));
      }
      
      const { reportType } = req.params;
      const { startDate, endDate, userId, groupBy, limit, conversionGoal, eventType } = req.query;
      
      if (!reportType) {
        return next(createError(
          'VALIDATION_ERROR',
          'Report type is required'
        ));
      }
      
      if (!startDate || !endDate) {
        return next(createError(
          'VALIDATION_ERROR',
          'Start date and end date are required'
        ));
      }
      
      // Validate dates
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return next(createError(
          'VALIDATION_ERROR',
          'Invalid date format'
        ));
      }
      
      if (parsedStartDate > parsedEndDate) {
        return next(createError(
          'VALIDATION_ERROR',
          'Start date cannot be after end date'
        ));
      }
      
      // Validate conversion goal for conversion reports
      if (reportType === 'conversion' && !conversionGoal) {
        return next(createError(
          'VALIDATION_ERROR',
          'Conversion goal is required for conversion reports'
        ));
      }
      
      // Prepare report parameters
      const params = {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        userId,
        groupBy: groupBy || 'day',
        limit: limit ? parseInt(limit, 10) : undefined,
        conversionGoal,
        eventType
      };
      
      const report = await this.analyticsService.generateReport(reportType, params);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clean up old analytics data
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async cleanupOldData(req, res, next) {
    try {
      // Require admin authentication for cleanup
      if (!req.user || req.user.role !== 'admin') {
        return next(createError(
          'AUTHORIZATION_ERROR',
          'Admin privileges required for this operation'
        ));
      }
      
      const count = await this.analyticsService.cleanupOldData();
      res.status(200).json({ success: true, deletedCount: count });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get form analytics dashboard data
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getFormAnalyticsDashboard(req, res, next) {
    try {
      const { startDate, endDate, formType } = req.query;
      
      // Validate required parameters
      if (!startDate || !endDate) {
        return next(createError(
          'VALIDATION_ERROR',
          'Start date and end date are required'
        ));
      }
      
      // Parse dates
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return next(createError(
          'VALIDATION_ERROR',
          'Invalid date format. Please use ISO format (YYYY-MM-DD)'
        ));
      }
      
      // Get dashboard data
      const params = {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        formType: formType || null
      };
      
      const dashboardData = await this.analyticsService.generateReport('form_submissions', params);
      
      // Send response
      res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get form conversion rates
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getFormConversionRates(req, res, next) {
    try {
      const { startDate, endDate, formType, groupBy } = req.query;
      
      // Validate required parameters
      if (!startDate || !endDate) {
        return next(createError(
          'VALIDATION_ERROR',
          'Start date and end date are required'
        ));
      }
      
      // Parse dates
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return next(createError(
          'VALIDATION_ERROR',
          'Invalid date format. Please use ISO format (YYYY-MM-DD)'
        ));
      }
      
      // Get conversion data
      const params = {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        formType: formType || null,
        groupBy: groupBy || 'day'
      };
      
      const conversionData = await this.analyticsService.generateReport('form_conversions', params);
      
      // Send response
      res.status(200).json({
        success: true,
        data: conversionData
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get form submission time distribution
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getFormSubmissionTimeDistribution(req, res, next) {
    try {
      const { startDate, endDate, formType, interval } = req.query;
      
      // Validate required parameters
      if (!startDate || !endDate) {
        return next(createError(
          'VALIDATION_ERROR',
          'Start date and end date are required'
        ));
      }
      
      // Parse dates
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return next(createError(
          'VALIDATION_ERROR',
          'Invalid date format. Please use ISO format (YYYY-MM-DD)'
        ));
      }
      
      // Get time distribution data
      const params = {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        formType: formType || null,
        interval: interval || 'hour'
      };
      
      const timeDistribution = await this.analyticsService.generateReport('form_time_distribution', params);
      
      // Send response
      res.status(200).json({
        success: true,
        data: timeDistribution
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get real-time form analytics data
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getRealTimeFormAnalytics(req, res, next) {
    try {
      // Require authentication for accessing real-time analytics
      if (!req.user) {
        return next(createError(
          'AUTHENTICATION_ERROR',
          'Authentication required to access real-time analytics'
        ));
      }
      
      // Check if user has permission to access real-time analytics
      if (!['admin', 'manager', 'analyst'].includes(req.user.role)) {
        return next(createError(
          'AUTHORIZATION_ERROR',
          'You do not have permission to access real-time analytics'
        ));
      }
      
      // Verify that real-time analytics service is available
      if (!this.realTimeAnalyticsService) {
        return next(createError(
          'SERVICE_UNAVAILABLE',
          'Real-time analytics service is not available'
        ));
      }
      
      // Get current real-time stats
      const stats = this.realTimeAnalyticsService.getStats();
      
      // Send response
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset real-time analytics stats
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async resetRealTimeStats(req, res, next) {
    try {
      // Require admin authentication for reset
      if (!req.user || req.user.role !== 'admin') {
        return next(createError(
          'AUTHORIZATION_ERROR',
          'Admin privileges required to reset analytics stats'
        ));
      }
      
      // Verify that real-time analytics service is available
      if (!this.realTimeAnalyticsService) {
        return next(createError(
          'SERVICE_UNAVAILABLE',
          'Real-time analytics service is not available'
        ));
      }
      
      // Reset stats
      this.realTimeAnalyticsService.resetStats();
      
      // Send response
      res.status(200).json({
        success: true,
        message: 'Real-time analytics stats have been reset'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnalyticsController; 