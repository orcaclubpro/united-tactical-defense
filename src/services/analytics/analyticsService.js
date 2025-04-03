/**
 * Analytics Service Implementation
 */

const { AnalyticsServiceInterface } = require('../../core/interfaces/services');
const { createError } = require('../../api/middleware/errorHandler');
const { Analytics } = require('../../core/entities');

class AnalyticsService extends AnalyticsServiceInterface {
  /**
   * Constructor
   * @param {Object} analyticsRepository - Analytics repository
   * @param {Object} config - Configuration options
   */
  constructor(analyticsRepository, config) {
    super();
    this.analyticsRepository = analyticsRepository;
    this.config = config || {
      enableTracking: process.env.ENABLE_ANALYTICS_TRACKING !== 'false',
      sampleRate: process.env.ANALYTICS_SAMPLE_RATE || 1.0, // 100% by default
      retentionDays: process.env.ANALYTICS_RETENTION_DAYS || 90
    };
  }

  /**
   * Track page view
   * @param {Object} pageData - Page view data
   * @returns {Promise<void>}
   */
  async trackPageView(pageData) {
    if (!this.config.enableTracking) {
      return null;
    }

    // Apply sampling if configured
    if (Math.random() > this.config.sampleRate) {
      return null;
    }

    try {
      const { userId, path, referrer, userAgent, timestamp = new Date(), sessionId, deviceInfo } = pageData;

      const pageView = new Analytics({
        type: 'pageView',
        userId,
        sessionId,
        data: {
          path,
          referrer,
          userAgent,
          deviceInfo
        },
        timestamp,
        createdAt: new Date()
      });

      return this.analyticsRepository.create(pageView);
    } catch (error) {
      // Log the error but don't throw - analytics failures shouldn't break the application
      console.error('Error tracking page view:', error);
      return null;
    }
  }

  /**
   * Track event
   * @param {string} eventType - Event type
   * @param {Object} eventData - Event data
   * @returns {Promise<void>}
   */
  async trackEvent(eventType, eventData) {
    if (!this.config.enableTracking) {
      return null;
    }

    // Apply sampling if configured
    if (Math.random() > this.config.sampleRate) {
      return null;
    }

    try {
      const { userId, sessionId, timestamp = new Date(), metadata = {} } = eventData;

      const event = new Analytics({
        type: 'event',
        eventType,
        userId,
        sessionId,
        data: metadata,
        timestamp,
        createdAt: new Date()
      });

      return this.analyticsRepository.create(event);
    } catch (error) {
      // Log the error but don't throw - analytics failures shouldn't break the application
      console.error('Error tracking event:', error);
      return null;
    }
  }

  /**
   * Generate analytics report
   * @param {string} reportType - Report type
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} - Report data
   */
  async generateReport(reportType, params) {
    try {
      let reportData;

      // Call appropriate report generator based on report type
      switch (reportType) {
        case 'user_activity':
          reportData = await this._generateUserActivityReport(params);
          break;
        case 'page_views':
          reportData = await this._generatePageViewsReport(params);
          break;
        case 'events':
          reportData = await this._generateEventsReport(params);
          break;
        case 'conversion':
          reportData = await this._generateConversionReport(params);
          break;
        case 'form_submissions':
          reportData = await this._generateFormSubmissionsReport(params);
          break;
        case 'form_conversions':
          reportData = await this._generateFormConversionsReport(params);
          break;
        case 'form_time_distribution':
          reportData = await this._generateFormTimeDistributionReport(params);
          break;
        default:
          throw createError('INVALID_REQUEST', `Unknown report type: ${reportType}`);
      }

      return reportData;
    } catch (error) {
      console.error('Error generating analytics report:', error);
      throw error;
    }
  }

  /**
   * Generate form submissions report
   * @param {Object} params - Report parameters
   * @param {Date} params.startDate - Start date
   * @param {Date} params.endDate - End date
   * @param {string} params.formType - Optional form type filter
   * @returns {Promise<Object>} - Report data
   * @private
   */
  async _generateFormSubmissionsReport(params) {
    try {
      const { startDate, endDate, formType } = params;

      // Query analytics data for form events
      const eventTypeFilters = ['form_submission', 'form_processed', 'form_error'];
      let eventsData = await this.analyticsRepository.getEventsReport(
        startDate, 
        endDate, 
        eventTypeFilters, 
        'eventType', 
        null
      );

      // Filter by form type if specified
      if (formType) {
        eventsData = eventsData.filter(item => 
          item.metadata && item.metadata.formType === formType
        );
      }

      // Calculate summary metrics
      const totalSubmissions = eventsData.filter(e => e.eventType === 'form_submission').length;
      const totalProcessed = eventsData.filter(e => e.eventType === 'form_processed').length;
      const totalErrors = eventsData.filter(e => e.eventType === 'form_error').length;
      
      // Get submission counts by form type
      const submissionsByFormType = {};
      eventsData
        .filter(e => e.eventType === 'form_submission' && e.metadata?.formType)
        .forEach(e => {
          const formType = e.metadata.formType;
          submissionsByFormType[formType] = (submissionsByFormType[formType] || 0) + 1;
        });

      // Get error counts by type
      const errorsByType = {};
      eventsData
        .filter(e => e.eventType === 'form_error' && e.metadata?.errorType)
        .forEach(e => {
          const errorType = e.metadata.errorType;
          errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
        });

      // Get submission counts by day
      const submissionsByDay = {};
      eventsData
        .filter(e => e.eventType === 'form_submission')
        .forEach(e => {
          const date = new Date(e.timestamp).toISOString().split('T')[0];
          submissionsByDay[date] = (submissionsByDay[date] || 0) + 1;
        });

      return {
        summary: {
          totalSubmissions,
          totalProcessed,
          totalErrors,
          successRate: totalSubmissions > 0 ? (totalProcessed / totalSubmissions * 100).toFixed(2) : 0,
          errorRate: totalSubmissions > 0 ? (totalErrors / totalSubmissions * 100).toFixed(2) : 0
        },
        submissionsByFormType,
        errorsByType,
        submissionsByDay,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          formType: formType || 'all'
        }
      };
    } catch (error) {
      console.error('Error generating form submissions report:', error);
      throw error;
    }
  }

  /**
   * Generate form conversions report
   * @param {Object} params - Report parameters
   * @param {Date} params.startDate - Start date
   * @param {Date} params.endDate - End date
   * @param {string} params.formType - Optional form type filter
   * @param {string} params.groupBy - Group by field (day, week, month)
   * @returns {Promise<Object>} - Report data
   * @private
   */
  async _generateFormConversionsReport(params) {
    try {
      const { startDate, endDate, formType, groupBy = 'day' } = params;

      // Query analytics data for form conversion events
      const conversions = await this.analyticsRepository.findByEventType('form_conversion');
      
      // Filter by date range
      let filteredConversions = conversions.filter(c => {
        const timestamp = new Date(c.timestamp);
        return timestamp >= startDate && timestamp <= endDate;
      });

      // Filter by form type if specified
      if (formType) {
        filteredConversions = filteredConversions.filter(c => 
          c.data.formType === formType
        );
      }

      // Group by specified interval
      const conversionsByInterval = {};
      const conversionsByType = {};
      
      filteredConversions.forEach(c => {
        // Calculate interval key based on groupBy
        let intervalKey;
        const timestamp = new Date(c.timestamp);
        
        if (groupBy === 'day') {
          intervalKey = timestamp.toISOString().split('T')[0];
        } else if (groupBy === 'week') {
          // Get the first day of the week (Monday)
          const day = timestamp.getDay();
          const diff = timestamp.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(timestamp);
          monday.setDate(diff);
          intervalKey = monday.toISOString().split('T')[0];
        } else if (groupBy === 'month') {
          intervalKey = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}`;
        }
        
        // Increment counts
        conversionsByInterval[intervalKey] = (conversionsByInterval[intervalKey] || 0) + 1;
        
        // Track by conversion type
        const conversionType = c.data.conversionType || 'unknown';
        if (!conversionsByType[conversionType]) {
          conversionsByType[conversionType] = {};
        }
        conversionsByType[conversionType][intervalKey] = (conversionsByType[conversionType][intervalKey] || 0) + 1;
      });

      // Calculate average time to conversion
      let totalTimeToConversion = 0;
      let conversionTimeCount = 0;
      
      filteredConversions.forEach(c => {
        if (c.data.timeToConversion) {
          totalTimeToConversion += c.data.timeToConversion;
          conversionTimeCount++;
        }
      });
      
      const avgTimeToConversion = conversionTimeCount > 0 
        ? Math.round(totalTimeToConversion / conversionTimeCount) 
        : null;

      return {
        totalConversions: filteredConversions.length,
        conversionsByInterval,
        conversionsByType,
        avgTimeToConversion,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          formType: formType || 'all',
          groupBy
        }
      };
    } catch (error) {
      console.error('Error generating form conversions report:', error);
      throw error;
    }
  }

  /**
   * Generate form submission time distribution report
   * @param {Object} params - Report parameters
   * @param {Date} params.startDate - Start date
   * @param {Date} params.endDate - End date
   * @param {string} params.formType - Optional form type filter
   * @param {string} params.interval - Interval type (hour, day, weekday)
   * @returns {Promise<Object>} - Report data
   * @private
   */
  async _generateFormTimeDistributionReport(params) {
    try {
      const { startDate, endDate, formType, interval = 'hour' } = params;

      // Query analytics data for form submission events
      const submissions = await this.analyticsRepository.findByEventType('form_submission');
      
      // Filter by date range
      let filteredSubmissions = submissions.filter(s => {
        const timestamp = new Date(s.timestamp);
        return timestamp >= startDate && timestamp <= endDate;
      });

      // Filter by form type if specified
      if (formType) {
        filteredSubmissions = filteredSubmissions.filter(s => 
          s.data.formType === formType
        );
      }

      // Group by specified interval
      const distributionData = {};
      
      filteredSubmissions.forEach(s => {
        const timestamp = new Date(s.timestamp);
        let key;
        
        if (interval === 'hour') {
          // Group by hour of day (0-23)
          key = timestamp.getHours();
        } else if (interval === 'day') {
          // Group by day of month (1-31)
          key = timestamp.getDate();
        } else if (interval === 'weekday') {
          // Group by day of week (0-6, where 0 is Sunday)
          key = timestamp.getDay();
          // Convert to named days for readability
          const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          key = weekdays[key];
        }
        
        distributionData[key] = (distributionData[key] || 0) + 1;
      });
      
      // For hour interval, ensure all hours are represented
      if (interval === 'hour') {
        for (let i = 0; i < 24; i++) {
          if (distributionData[i] === undefined) {
            distributionData[i] = 0;
          }
        }
      }

      return {
        distributionData,
        total: filteredSubmissions.length,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          formType: formType || 'all',
          interval
        }
      };
    } catch (error) {
      console.error('Error generating form time distribution report:', error);
      throw error;
    }
  }

  /**
   * Clean up old analytics data
   * @returns {Promise<number>} - Number of records deleted
   */
  async cleanupOldData() {
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - this.config.retentionDays);
    
    return this.analyticsRepository.deleteOlderThan(retentionDate);
  }
}

module.exports = AnalyticsService; 