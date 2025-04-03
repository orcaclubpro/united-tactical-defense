const { getDbConnection } = require('../config/database');
const moment = require('moment');
const AnalyticsInsightService = require('./analyticsInsightService');

/**
 * Service for tracking metrics in the background
 */
class MetricTrackingService {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.insightInterval = null;
    this.dailyReportInterval = null;
    this.weeklyReportInterval = null;
    this.monthlyReportInterval = null;
    this.metrics = {
      landingPageVisits: 0,
      conversions: 0,
      conversionRate: 0,
      referralCounts: {},
      devices: {},
      geography: {},
      trends: {
        dailyVisits: [],
        conversionRate: []
      },
      lastUpdated: new Date().toISOString()
    };
    this.insights = [];
    this.anomalies = [];
    
    // Schedule metrics processing
    this.startMetricsProcessing();
    
    // Schedule report generation
    this.scheduleDailyReport();
    this.scheduleWeeklyReport();
    this.scheduleMonthlyReport();
    
    // Generate initial metrics
    this.processMetrics().then(() => {
      console.log('Initial metrics processed at', new Date().toISOString());
    });
    
    // Generate an initial report to populate the dashboard
    this.generateInitialReport();
  }

  /**
   * Start the tracking service
   * @param {number} intervalMs - Interval in milliseconds for background processing
   * @param {number} insightIntervalMs - Interval for generating insights
   */
  start(intervalMs = 60000, insightIntervalMs = 3600000) { // Default to 1 minute, insights hourly
    if (this.isRunning) {
      console.log('Metric tracking service is already running');
      return;
    }

    console.log('Starting metric tracking service');
    this.isRunning = true;
    
    // Process metrics on the specified interval
    this.interval = setInterval(() => this.processMetrics(), intervalMs);
    
    // Generate insights less frequently (hourly by default)
    this.insightInterval = setInterval(() => this.generateInsights(), insightIntervalMs);
    
    // Schedule daily report at midnight
    this.scheduleDailyReport();
    
    // Schedule weekly report on Sunday midnight
    this.scheduleWeeklyReport();
    
    // Schedule monthly report at end of month
    this.scheduleMonthlyReport();
    
    // Process immediately on start
    this.processMetrics();
    this.generateInsights();
  }

  /**
   * Stop the tracking service
   */
  stop() {
    if (!this.isRunning) {
      console.log('Metric tracking service is not running');
      return;
    }

    console.log('Stopping metric tracking service');
    clearInterval(this.interval);
    clearInterval(this.insightInterval);
    clearTimeout(this.dailyReportInterval);
    clearTimeout(this.weeklyReportInterval);
    clearTimeout(this.monthlyReportInterval);
    this.interval = null;
    this.insightInterval = null;
    this.dailyReportInterval = null;
    this.weeklyReportInterval = null;
    this.monthlyReportInterval = null;
    this.isRunning = false;
  }

  /**
   * Schedule daily report at midnight
   */
  scheduleDailyReport() {
    const now = new Date();
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );
    
    // If it's already past the end of day, schedule for tomorrow
    if (now >= endOfDay) {
      endOfDay.setDate(endOfDay.getDate() + 1);
    }
    
    const timeUntilEndOfDay = endOfDay.getTime() - now.getTime();
    
    this.dailyReportInterval = setTimeout(() => {
      this.generateDailyReport();
      
      // Reschedule for the next day
      this.scheduleDailyReport();
    }, timeUntilEndOfDay);
    
    console.log(`Daily report scheduled for ${endOfDay.toISOString()} (${timeUntilEndOfDay}ms from now)`);
  }
  
  /**
   * Schedule weekly report on Sunday midnight
   */
  scheduleWeeklyReport() {
    const now = new Date();
    const daysUntilSunday = 7 - now.getDay();
    const sunday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysUntilSunday,
      0, 0, 0, 0 // midnight
    );
    
    const timeUntilSunday = sunday.getTime() - now.getTime();
    
    this.weeklyReportInterval = setTimeout(() => {
      this.generateWeeklyReport();
      
      // Reschedule for next week
      this.scheduleWeeklyReport();
    }, timeUntilSunday);
    
    console.log(`Weekly report scheduled for Sunday midnight (${timeUntilSunday}ms from now)`);
  }
  
  /**
   * Schedule the next monthly report
   */
  scheduleMonthlyReport() {
    try {
      // Get the next first of the month at midnight
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
      let msUntilNextMonth = nextMonth.getTime() - now.getTime();
      
      console.log('Monthly report scheduled for', nextMonth.toISOString());
      
      // Handle timeout overflow by using the maximum safe timeout value
      const MAX_TIMEOUT = 2147483647; // ~24.8 days in milliseconds
      
      if (msUntilNextMonth > MAX_TIMEOUT) {
        console.log(`Using intermediate timeout of ${MAX_TIMEOUT}ms, target date: ${nextMonth.toISOString()}`);
        
        // Set an intermediate timeout to handle the overflow, using the max value
        this.monthlyTimeout = setTimeout(() => {
          // Reschedule when we're closer to the target date
          console.log('Intermediate timeout completed, rescheduling monthly report');
          this.scheduleMonthlyReport();
        }, MAX_TIMEOUT);
      } else {
        // We're close enough to schedule the actual report
        console.log(`Setting timeout for ${msUntilNextMonth}ms`);
        this.monthlyTimeout = setTimeout(() => {
          console.log('Generating monthly report...');
          
          // Only attempt to generate if not disabled
          if (!this.disableMonthlyReportGeneration) {
            this.generateMonthlyReport();
          } else {
            console.log('Monthly report generation temporarily disabled for debugging');
          }
          
          // Schedule the next monthly report
          this.scheduleMonthlyReport();
        }, msUntilNextMonth);
      }
    } catch (error) {
      console.error('Error scheduling monthly report:', error);
    }
  }

  /**
   * Generate daily report
   */
  async generateDailyReport() {
    console.log('Generating daily report at', new Date().toISOString());
    
    try {
      // Get data for the past day
      const now = new Date();
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      
      // Get the visit count for the day
      const visitCount = await this.getPageVisitsCount(dayStart, dayEnd);

      // Simple mock data for testing
      const reportData = {
        landingPageVisits: visitCount,
        conversions: Math.round(visitCount * 0.1), // 10% conversion rate
        referralCounts: {
          'google': Math.round(visitCount * 0.4),
          'direct': Math.round(visitCount * 0.3),
          'facebook': Math.round(visitCount * 0.2),
          'other': Math.round(visitCount * 0.1)
        },
        devices: {
          'desktop': Math.round(visitCount * 0.6),
          'mobile': Math.round(visitCount * 0.3),
          'tablet': Math.round(visitCount * 0.1)
        },
        geography: {
          'US': Math.round(visitCount * 0.7),
          'Canada': Math.round(visitCount * 0.2),
          'Other': Math.round(visitCount * 0.1)
        },
        // Average time in seconds
        averageTimePerUser: 180,
        report_type: 'daily'
      };
      
      await this.storeMetricsSnapshot(reportData);
      console.log('Daily report generated and stored successfully');
      
      // Schedule the next daily report at midnight
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeUntilNextReport = tomorrow.getTime() - Date.now();
      setTimeout(() => this.generateDailyReport(), timeUntilNextReport);
      console.log(`Daily report scheduled for ${tomorrow.toISOString()} (${timeUntilNextReport}ms from now)`);
    } catch (error) {
      console.error('Error generating daily report:', error);
    }
  }
  
  /**
   * Reset today's metrics to start fresh
   * This doesn't delete any data but updates in-memory metrics for today
   */
  async resetTodayMetrics() {
    try {
      // Get today's start time
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      
      // Reset today's counters in memory
      this.metrics = {
        ...this.metrics,
        landingPageVisits: 0,
        conversions: 0,
        conversionRate: 0,
        averageTimePerUser: 0,
        lastUpdated: new Date().toISOString()
      };
      
      console.log('Today\'s metrics have been reset');
    } catch (error) {
      console.error('Error resetting today\'s metrics:', error);
    }
  }
  
  /**
   * Generate weekly report
   */
  async generateWeeklyReport() {
    console.log('Generating weekly report at', new Date().toISOString());
    
    try {
      // Get data for the past week
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
      const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      
      // Landing page visits for the week
      const landingPageVisits = await this.getLandingPageVisitsCount(weekStart, weekEnd);
      
      // Conversions for the week
      const conversions = await this.getConversionsCount(weekStart, weekEnd);
      
      // Referral sources for the week
      const referralCounts = await this.getReferralCounts(weekStart, weekEnd);
      
      // Device breakdown for the week
      const devices = await this.getDeviceBreakdown(weekStart, weekEnd);
      
      // Geographic distribution for the week
      const geography = await this.getGeographicDistribution(weekStart, weekEnd);
      
      // Average time spent per user
      const averageTimePerUser = await this.getAverageTimePerUser(weekStart, weekEnd);
      
      // Store the weekly report
      const reportData = {
        landingPageVisits,
        conversions,
        referralCounts,
        devices,
        geography,
        averageTimePerUser,
        report_type: 'weekly'
      };
      
      await this.storeMetricsSnapshot(reportData);
      console.log('Weekly report generated and stored successfully');
    } catch (error) {
      console.error('Error generating weekly report:', error);
    }
  }
  
  /**
   * Generate monthly report
   */
  async generateMonthlyReport() {
    console.log('Monthly report generation temporarily disabled for debugging');
    return;
    
    // Original code below is disabled
    /*
    console.log('Generating monthly report at', new Date().toISOString());
    
    try {
      // Get data for the past month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString();
      const monthEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      
      // Landing page visits for the month
      const landingPageVisits = await this.getLandingPageVisitsCount(monthStart, monthEnd);
      
      // Conversions for the month
      const conversions = await this.getConversionsCount(monthStart, monthEnd);
      
      // Referral sources for the month
      const referralCounts = await this.getReferralCounts(monthStart, monthEnd);
      
      // Device breakdown for the month
      const devices = await this.getDeviceBreakdown(monthStart, monthEnd);
      
      // Geographic distribution for the month
      const geography = await this.getGeographicDistribution(monthStart, monthEnd);
      
      // Average time spent per user
      const averageTimePerUser = await this.getAverageTimePerUser(monthStart, monthEnd);
      
      // Store the monthly report
      const reportData = {
        landingPageVisits,
        conversions,
        referralCounts,
        devices,
        geography,
        averageTimePerUser,
        report_type: 'monthly'
      };
      
      await this.storeMetricsSnapshot(reportData);
      console.log('Monthly report generated and stored successfully');
    } catch (error) {
      console.error('Error generating monthly report:', error);
    }
    */
  }

  /**
   * Process metrics in the background
   */
  async processMetrics() {
    try {
      console.log('Processing metrics at', new Date().toISOString());
      
      // Get current date for queries
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
      const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
      
      // Update landing page visits metric (visits today)
      const landingPageVisits = await this.getLandingPageVisitsCount(todayStart);
      
      // Update conversions metric (conversions today)
      const conversions = await this.getConversionsCount(todayStart);
      
      // Update referral sources metrics (top sources today)
      const referralCounts = await this.getReferralCounts(todayStart);
      
      // Get device breakdown
      const devices = await this.getDeviceBreakdown(todayStart);
      
      // Get geographic distribution
      const geography = await this.getGeographicDistribution(todayStart);
      
      // Get average time spent per user
      const averageTimePerUser = await this.getAverageTimePerUser(todayStart);
      
      // Get daily trends (last 7 days)
      const dailyVisits = await this.getDailyVisitsTrend(lastWeekStart);
      const conversionRate = await this.getConversionRateTrend(lastWeekStart);
      
      // Check for anomalies in traffic or conversions
      const anomalies = await this.checkForAnomalies(yesterdayStart);
      if (anomalies.length > 0) {
        this.anomalies = [...this.anomalies, ...anomalies];
        // Keep only the last 20 anomalies
        if (this.anomalies.length > 20) {
          this.anomalies = this.anomalies.slice(-20);
        }
      }
      
      // Update metrics object
      this.metrics = {
        landingPageVisits,
        conversions,
        conversionRate: landingPageVisits > 0 ? (conversions / landingPageVisits * 100).toFixed(2) : 0,
        averageTimePerUser,
        referralCounts,
        devices,
        geography,
        trends: {
          dailyVisits,
          conversionRate
        },
        lastUpdated: new Date().toISOString()
      };
      
      // Log current metrics summary
      console.log(`Metrics updated: ${landingPageVisits} visits, ${conversions} conversions (${this.metrics.conversionRate}%)`);
      
      // Store metrics in the database for historical tracking
      await this.storeMetricsSnapshot({
        landingPageVisits,
        conversions,
        referralCounts,
        devices,
        geography,
        report_type: 'realtime'
      });
    } catch (error) {
      console.error('Error processing metrics:', error);
    }
  }

  /**
   * Generate insights based on collected data
   */
  async generateInsights() {
    try {
      console.log('Generating analytics insights at', new Date().toISOString());
      
      // Get insights for the last 30 days
      const thirtyDaysAgo = moment().subtract(30, 'days').format('YYYY-MM-DD');
      
      const insights = await AnalyticsInsightService.generateLandingPageInsights({
        startDate: thirtyDaysAgo
      });
      
      // Get optimization suggestions
      const suggestions = await AnalyticsInsightService.getOptimizationSuggestions({
        startDate: thirtyDaysAgo
      });
      
      // Store insights and suggestions
      this.insights = [...insights, ...suggestions.map(s => ({
        type: 'suggestion',
        metric: 'optimization',
        entity: s.target,
        message: s.suggestion,
        priority: s.priority,
        data: s
      }))];
      
      console.log(`Generated ${insights.length} insights and ${suggestions.length} suggestions`);
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  }

  /**
   * Get the count of landing page visits
   * @param {string} since - ISO date string
   * @param {string} until - ISO date string (optional)
   * @returns {Promise<number>} - Count of landing page visits
   */
  async getLandingPageVisitsCount(since, until = null) {
    let query = `
      SELECT COUNT(*) as count
      FROM page_visits
      WHERE is_landing_page = 1
    `;
    
    const params = [];
    
    if (since) {
      query += `\n      AND visit_time >= ?`;
      params.push(since);
    }
    
    if (until) {
      query += `\n      AND visit_time < ?`;
      params.push(until);
    }
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(row ? row.count : 0);
          }
        });
      });
    } catch (error) {
      console.error('Error getting landing page visits count:', error);
      return 0;
    }
  }

  /**
   * Get current conversions count
   * @param {string} since - ISO date string to count conversions since
   * @param {string} until - ISO date string to count conversions until (optional)
   * @returns {Promise<number>} - Number of conversions
   */
  async getConversionsCount(since, until = null) {
    let query = `
      SELECT COUNT(*) as count
      FROM conversions c
      JOIN page_visits pv ON c.visit_id = pv.id
      WHERE pv.is_landing_page = 1
    `;
    
    const whereConditions = [];
    const params = [];
    
    if (since) {
      whereConditions.push("c.conversion_time >= ?");
      params.push(since);
    }
    
    if (until) {
      whereConditions.push("c.conversion_time < ?");
      params.push(until);
    }
    
    if (whereConditions.length > 0) {
      query += " AND " + whereConditions.join(" AND ");
    }
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(row ? row.count : 0);
          }
        });
      });
    } catch (error) {
      console.error('Error getting conversions count:', error);
      return 0;
    }
  }

  /**
   * Get referral counts
   * @param {string} since - ISO date string to count referrals since
   * @param {string} until - ISO date string to count referrals until (optional)
   * @returns {Promise<Object>} - Object with referral counts
   */
  async getReferralCounts(since, until = null) {
    let query = `
      SELECT 
        COALESCE(utm_source, 'Direct') as source,
        COUNT(*) as count
      FROM page_visits
      WHERE is_landing_page = 1
    `;
    
    const whereConditions = [];
    const params = [];
    
    if (since) {
      whereConditions.push("visit_time >= ?");
      params.push(since);
    }
    
    if (until) {
      whereConditions.push("visit_time < ?");
      params.push(until);
    }
    
    if (whereConditions.length > 0) {
      query += " AND " + whereConditions.join(" AND ");
    }
    
    query += `
      GROUP BY COALESCE(utm_source, 'Direct')
      ORDER BY count DESC
      LIMIT 10
    `;
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            const result = {};
            rows.forEach(row => {
              result[row.source] = row.count;
            });
            resolve(result);
          }
        });
      });
    } catch (error) {
      console.error('Error getting referral counts:', error);
      return {};
    }
  }

  /**
   * Get device breakdown for visits
   * @param {string} since - ISO date string
   * @param {string} until - ISO date string (optional)
   * @returns {Promise<Object>} - Device breakdown data
   */
  async getDeviceBreakdown(since, until = null) {
    let query = `
      SELECT 
        device_type,
        COUNT(*) as count
      FROM 
        page_visits
      WHERE 
        device_type IS NOT NULL
    `;
    
    const whereConditions = [];
    const params = [];
    
    if (since) {
      whereConditions.push("visit_time >= ?");
      params.push(since);
    }
    
    if (until) {
      whereConditions.push("visit_time <= ?");
      params.push(until);
    }
    
    if (whereConditions.length > 0) {
      query += " AND " + whereConditions.join(" AND ");
    }
    
    query += `
      GROUP BY 
        device_type
      ORDER BY 
        count DESC
    `;
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            const result = {};
            rows.forEach(row => {
              result[row.device_type || 'unknown'] = row.count;
            });
            resolve(result);
          }
        });
      });
    } catch (error) {
      console.error('Error getting device breakdown:', error);
      return {};
    }
  }

  /**
   * Get geographic distribution of visitors
   * @param {string} since - ISO date string
   * @param {string} until - ISO date string (optional)
   * @returns {Promise<Object>} - Geographic distribution data
   */
  async getGeographicDistribution(since, until = null) {
    let query = `
      SELECT 
        COALESCE(country, 'Unknown') as region,
        COUNT(*) as count
      FROM 
        page_visits
      WHERE 
        country IS NOT NULL
    `;
    
    const whereConditions = [];
    const params = [];
    
    if (since) {
      whereConditions.push("visit_time >= ?");
      params.push(since);
    }
    
    if (until) {
      whereConditions.push("visit_time <= ?");
      params.push(until);
    }
    
    if (whereConditions.length > 0) {
      query += " AND " + whereConditions.join(" AND ");
    }
    
    query += `
      GROUP BY 
        region
      ORDER BY 
        count DESC
      LIMIT 20
    `;
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            const result = {};
            rows.forEach(row => {
              result[row.region] = row.count;
            });
            resolve(result);
          }
        });
      });
    } catch (error) {
      console.error('Error getting geographic distribution:', error);
      return {};
    }
  }

  /**
   * Get daily visits trend
   * @param {string} since - ISO date string
   * @returns {Promise<Array>} - Daily visits trend data
   */
  async getDailyVisitsTrend(since) {
    const query = `
      SELECT 
        date(visit_time) as date,
        COUNT(*) as visits
      FROM page_visits
      WHERE is_landing_page = 1
      AND is_bot = 0
      AND visit_time >= ?
      GROUP BY date(visit_time)
      ORDER BY date ASC
    `;
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.all(query, [since], (err, results) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    } catch (error) {
      console.error('Error getting daily visits trend:', error);
      return [];
    }
  }

  /**
   * Get conversion rate trend
   * @param {string} since - ISO date string
   * @returns {Promise<Array>} - Conversion rate trend data
   */
  async getConversionRateTrend(since) {
    const query = `
      SELECT 
        date(pv.visit_time) as date,
        COUNT(DISTINCT pv.id) as visits,
        COUNT(DISTINCT c.id) as conversions,
        ROUND(COUNT(DISTINCT c.id) * 100.0 / COUNT(DISTINCT pv.id), 2) as rate
      FROM 
        page_visits pv
      LEFT JOIN 
        conversions c ON pv.id = c.visit_id
      WHERE 
        pv.is_landing_page = 1
        AND pv.is_bot = 0
        AND pv.visit_time >= ?
      GROUP BY 
        date(pv.visit_time)
      ORDER BY 
        date ASC
    `;
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.all(query, [since], (err, results) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    } catch (error) {
      console.error('Error getting conversion rate trend:', error);
      return [];
    }
  }

  /**
   * Check for anomalies in traffic or conversions
   * @param {string} since - ISO date string
   * @returns {Promise<Array>} - Detected anomalies
   */
  async checkForAnomalies(since) {
    try {
      const db = getDbConnection();
      
      // Get daily traffic data for the last 30 days
      const thirtyDaysAgo = moment().subtract(30, 'days').format('YYYY-MM-DD');
      
      const query = `
        WITH daily_stats AS (
          SELECT 
            date(pv.visit_time) as date,
            COUNT(DISTINCT pv.id) as visits,
            COUNT(DISTINCT c.id) as conversions,
            ROUND(COUNT(DISTINCT c.id) * 100.0 / NULLIF(COUNT(DISTINCT pv.id), 0), 2) as conversion_rate
          FROM 
            page_visits pv
          LEFT JOIN 
            conversions c ON pv.id = c.visit_id
          WHERE 
            pv.is_landing_page = 1
            AND pv.is_bot = 0
            AND pv.visit_time >= ?
          GROUP BY 
            date(pv.visit_time)
        ),
        stats AS (
          SELECT 
            AVG(visits) as avg_visits,
            STDEV(visits) as stdev_visits,
            AVG(conversion_rate) as avg_rate,
            STDEV(conversion_rate) as stdev_rate
          FROM 
            daily_stats
        )
        SELECT 
          ds.*,
          (SELECT avg_visits FROM stats) as avg_visits,
          (SELECT stdev_visits FROM stats) as stdev_visits,
          (SELECT avg_rate FROM stats) as avg_rate,
          (SELECT stdev_rate FROM stats) as stdev_rate,
          CASE 
            WHEN ABS(ds.visits - (SELECT avg_visits FROM stats)) > 2 * (SELECT stdev_visits FROM stats) THEN 1
            ELSE 0
          END as is_visit_anomaly,
          CASE 
            WHEN ABS(ds.conversion_rate - (SELECT avg_rate FROM stats)) > 2 * (SELECT stdev_rate FROM stats) THEN 1
            ELSE 0
          END as is_rate_anomaly
        FROM 
          daily_stats ds
        WHERE 
          ds.date >= ?
        ORDER BY 
          ds.date DESC
      `;
      
      const results = await new Promise((resolve, reject) => {
        db.all(query, [thirtyDaysAgo, since], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      
      db.close();
      
      // Build anomaly objects
      const anomalies = [];
      
      for (const row of results) {
        if (row.is_visit_anomaly) {
          const percentChange = ((row.visits - row.avg_visits) / row.avg_visits * 100).toFixed(2);
          anomalies.push({
            date: row.date,
            type: 'traffic',
            metric: 'visits',
            value: row.visits,
            average: row.avg_visits,
            percentChange: parseFloat(percentChange),
            message: `Traffic ${percentChange > 0 ? 'increase' : 'decrease'} of ${Math.abs(percentChange)}% detected (${row.visits} vs avg ${row.avg_visits.toFixed(0)})`
          });
        }
        
        if (row.is_rate_anomaly) {
          const percentChange = ((row.conversion_rate - row.avg_rate) / row.avg_rate * 100).toFixed(2);
          anomalies.push({
            date: row.date,
            type: 'conversion',
            metric: 'conversion_rate',
            value: row.conversion_rate,
            average: row.avg_rate,
            percentChange: parseFloat(percentChange),
            message: `Conversion rate ${percentChange > 0 ? 'increase' : 'decrease'} of ${Math.abs(percentChange)}% detected (${row.conversion_rate}% vs avg ${row.avg_rate.toFixed(2)}%)`
          });
        }
      }
      
      return anomalies;
    } catch (error) {
      console.error('Error checking for anomalies:', error);
      return [];
    }
  }

  /**
   * Store current metrics in the database for historical tracking
   * @param {Object} data - Metrics data to store
   */
  async storeMetricsSnapshot(data) {
    const query = `
      INSERT INTO metrics_snapshots (
        landing_page_visits,
        conversions,
        referral_counts,
        devices,
        geography,
        average_time_per_user,
        report_type,
        snapshot_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.run(
          query, 
          [
            data.landingPageVisits, 
            data.conversions, 
            JSON.stringify(data.referralCounts),
            JSON.stringify(data.devices),
            JSON.stringify(data.geography),
            data.averageTimePerUser || 0,
            data.report_type
          ],
          function(err) {
            db.close();
            if (err) {
              reject(err);
            } else {
              console.log(`Metrics snapshot (${data.report_type}) stored`);
              resolve({ lastID: this.lastID, changes: this.changes });
            }
          }
        );
      });
    } catch (error) {
      console.error('Error storing metrics snapshot:', error);
    }
  }

  /**
   * Get the current metrics
   * @returns {Object} - Current metrics
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Get current insights
   * @returns {Array} - Current insights
   */
  getInsights() {
    return this.insights;
  }

  /**
   * Get detected anomalies
   * @returns {Array} - Detected anomalies
   */
  getAnomalies() {
    return this.anomalies;
  }

  /**
   * Get metrics snapshots by report type
   * @param {string} reportType - Report type (daily, weekly, monthly, realtime)
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} - Array of metric snapshots
   */
  async getMetricsSnapshotsByType(reportType, limit = 30) {
    const query = `
      SELECT 
        id,
        landing_page_visits,
        conversions,
        referral_counts,
        devices,
        geography,
        report_type,
        snapshot_time
      FROM metrics_snapshots
      WHERE report_type = ?
      ORDER BY snapshot_time DESC
      LIMIT ?
    `;
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.all(query, [reportType, limit], (err, rows) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            // Parse JSON strings in the results
            const parsedRows = rows.map(row => ({
              ...row,
              referral_counts: JSON.parse(row.referral_counts || '{}'),
              devices: row.devices ? JSON.parse(row.devices) : {},
              geography: row.geography ? JSON.parse(row.geography) : {}
            }));
            
            resolve(parsedRows);
          }
        });
      });
    } catch (error) {
      console.error(`Error getting ${reportType} metrics snapshots:`, error);
      return [];
    }
  }
  
  /**
   * Get the latest metrics snapshot by report type
   * @param {string} reportType - Report type (daily, weekly, monthly, realtime)
   * @returns {Promise<Object>} - Latest metrics snapshot
   */
  async getLatestMetricsSnapshot(reportType) {
    const snapshots = await this.getMetricsSnapshotsByType(reportType, 1);
    return snapshots.length > 0 ? snapshots[0] : null;
  }

  /**
   * Get average time spent per user
   * @param {string} since - ISO date string
   * @param {string} until - ISO date string (optional)
   * @returns {Promise<number>} - Average time spent in minutes
   */
  async getAverageTimePerUser(since, until = null) {
    let query = `
      SELECT 
        AVG(time_on_page) as average_time
      FROM 
        page_engagement pe
      JOIN 
        page_visits pv ON pe.visit_id = pv.id
      WHERE 
        pv.is_bot = 0
        AND pe.engagement_time >= ?
    `;
    
    const params = [since];
    
    if (until) {
      query += ` AND pe.engagement_time < ?`;
      params.push(until);
    }
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(row?.average_time || 0);
          }
        });
      });
    } catch (error) {
      console.error('Error getting average time per user:', error);
      return 0;
    }
  }

  /**
   * Generate initial report if needed
   */
  async generateInitialReport() {
    try {
      // Check if we already have a daily report
      const latestDaily = await this.getLatestMetricsSnapshot('daily');
      if (!latestDaily) {
        console.log('No daily report found, generating initial report...');
        this.generateDailyReport();
      }
      
      // Check if we have a weekly report
      const latestWeekly = await this.getLatestMetricsSnapshot('weekly');
      if (!latestWeekly) {
        console.log('No weekly report found, generating initial report...');
        this.generateWeeklyReport();
      }
      
      // Check if we have a monthly report
      const latestMonthly = await this.getLatestMetricsSnapshot('monthly');
      if (!latestMonthly) {
        console.log('No monthly report found, generating initial report...');
        this.generateMonthlyReport();
      }
    } catch (error) {
      console.error('Error generating initial reports:', error);
    }
  }
  
  /**
   * Start processing metrics in the background
   */
  startMetricsProcessing() {
    // Process metrics every 15 minutes
    this.metricsInterval = setInterval(() => {
      this.processMetrics().then(() => {
        console.log('Metrics processed at', new Date().toISOString());
      });
    }, 15 * 60 * 1000); // 15 minutes
  }

  /**
   * Get total page visits count
   * @param {string} since - ISO date string to count from
   * @param {string} until - ISO date string to count until (optional)
   * @returns {Promise<number>} - Total page visits count
   */
  async getPageVisitsCount(since, until = null) {
    let query = `
      SELECT COUNT(*) as count
      FROM page_visits
      WHERE 1=1
    `;
    
    const whereConditions = [];
    const params = [];
    
    if (since) {
      whereConditions.push("visit_time >= ?");
      params.push(since);
    }
    
    if (until) {
      whereConditions.push("visit_time < ?");
      params.push(until);
    }
    
    if (whereConditions.length > 0) {
      query += " AND " + whereConditions.join(" AND ");
    }
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(row ? row.count : 0);
          }
        });
      });
    } catch (error) {
      console.error('Error getting page visits count:', error);
      return 0;
    }
  }

  initialize() {
    // Schedule the daily report to run at midnight
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    
    // Generate an initial report now to populate the dashboard with data
    this.generateDailyReport();
    
    // Schedule the next report at midnight
    this.dailyTimeout = setTimeout(() => {
      this.generateDailyReport();
      
      // Then schedule reports daily
      this.dailyInterval = setInterval(() => {
        this.generateDailyReport();
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, timeUntilMidnight);
    
    // Schedule monthly report to run on the 1st of each month
    this.scheduleMonthlyReport();
  }
  
  /**
   * Start the metric tracking service
   */
  start() {
    console.log('Starting MetricTrackingService...');
    this.initialize();
    console.log('MetricTrackingService started successfully.');
  }
  
  /**
   * Stop the metric tracking service
   */
  stop() {
    console.log('Stopping MetricTrackingService...');
    
    // Clear all scheduled timers
    if (this.dailyTimeout) clearTimeout(this.dailyTimeout);
    if (this.dailyInterval) clearInterval(this.dailyInterval);
    if (this.monthlyTimeout) clearTimeout(this.monthlyTimeout);
    if (this.monthlyInterval) clearInterval(this.monthlyInterval);
    if (this.metricsInterval) clearInterval(this.metricsInterval);
    
    console.log('MetricTrackingService stopped successfully.');
  }
}

// Create singleton instance
const trackingService = new MetricTrackingService();

module.exports = trackingService; 