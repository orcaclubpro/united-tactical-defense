const { getDbConnection } = require('../config/database');
const moment = require('moment');

/**
 * Service for tracking metrics in the background
 */
class MetricTrackingService {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.metrics = {
      landingPageVisits: 0,
      conversions: 0,
      referralCounts: {}
    };
  }

  /**
   * Start the tracking service
   * @param {number} intervalMs - Interval in milliseconds for background processing
   */
  start(intervalMs = 60000) { // Default to 1 minute
    if (this.isRunning) {
      console.log('Metric tracking service is already running');
      return;
    }

    console.log('Starting metric tracking service');
    this.isRunning = true;
    this.interval = setInterval(() => this.processMetrics(), intervalMs);
    
    // Process immediately on start
    this.processMetrics();
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
    this.interval = null;
    this.isRunning = false;
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
      
      // Update landing page visits metric (visits today)
      const landingPageVisits = await this.getLandingPageVisitsCount(todayStart);
      
      // Update conversions metric (conversions today)
      const conversions = await this.getConversionsCount(todayStart);
      
      // Update referral sources metrics (top sources today)
      const referralCounts = await this.getReferralCounts(todayStart);
      
      // Update metrics object
      this.metrics = {
        landingPageVisits,
        conversions,
        referralCounts,
        lastUpdated: new Date().toISOString()
      };
      
      // Log current metrics
      console.log('Current metrics:', JSON.stringify(this.metrics, null, 2));
      
      // Store metrics in the database for historical tracking
      await this.storeMetricsSnapshot();
    } catch (error) {
      console.error('Error processing metrics:', error);
    }
  }

  /**
   * Get current landing page visits count
   * @param {string} since - ISO date string to count visits since
   * @returns {Promise<number>} - Number of landing page visits
   */
  async getLandingPageVisitsCount(since) {
    const query = `
      SELECT COUNT(*) as count
      FROM page_visits
      WHERE is_landing_page = 1
      AND visit_time >= ?
    `;
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.get(query, [since], (err, result) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(result.count);
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
   * @returns {Promise<number>} - Number of conversions
   */
  async getConversionsCount(since) {
    const query = `
      SELECT COUNT(*) as count
      FROM conversions c
      JOIN page_visits pv ON c.visit_id = pv.id
      WHERE pv.is_landing_page = 1
      AND c.conversion_time >= ?
    `;
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.get(query, [since], (err, result) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(result.count);
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
   * @returns {Promise<Object>} - Object with referral counts
   */
  async getReferralCounts(since) {
    const query = `
      SELECT 
        COALESCE(utm_source, 'Direct') as source,
        COUNT(*) as count
      FROM page_visits
      WHERE is_landing_page = 1
      AND visit_time >= ?
      GROUP BY utm_source
      ORDER BY count DESC
      LIMIT 10
    `;
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.all(query, [since], (err, results) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            // Convert to object
            const counts = {};
            results.forEach(row => {
              counts[row.source] = row.count;
            });
            resolve(counts);
          }
        });
      });
    } catch (error) {
      console.error('Error getting referral counts:', error);
      return {};
    }
  }

  /**
   * Store current metrics in the database for historical tracking
   */
  async storeMetricsSnapshot() {
    const query = `
      INSERT INTO metrics_snapshots (
        landing_page_visits,
        conversions,
        referral_counts,
        snapshot_time
      ) VALUES (?, ?, ?, datetime('now'))
    `;
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.run(
          query, 
          [
            this.metrics.landingPageVisits, 
            this.metrics.conversions, 
            JSON.stringify(this.metrics.referralCounts)
          ],
          function(err) {
            db.close();
            if (err) {
              reject(err);
            } else {
              console.log('Metrics snapshot stored');
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
}

// Create singleton instance
const trackingService = new MetricTrackingService();

module.exports = trackingService; 