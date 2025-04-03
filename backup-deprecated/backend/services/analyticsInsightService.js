const { getDbConnection } = require('../config/database');
const moment = require('moment');

/**
 * Service for generating analytics insights
 */
class AnalyticsInsightService {
  /**
   * Generate insights about landing page performance
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} - Array of insights
   */
  static async generateLandingPageInsights(filters = {}) {
    try {
      const db = getDbConnection();
      const insights = [];
      
      // Get conversion rate trends by landing page
      const conversionTrends = await this.getConversionRateTrends(db, filters);
      
      // Generate insights based on conversion rate trends
      for (const trend of conversionTrends) {
        if (trend.trend > 0.05) {
          insights.push({
            type: 'positive',
            metric: 'conversion_rate',
            entity: trend.page_url,
            message: `${trend.page_url} conversion rate has increased by ${(trend.trend * 100).toFixed(1)}% over the period`,
            data: trend
          });
        } else if (trend.trend < -0.05) {
          insights.push({
            type: 'negative',
            metric: 'conversion_rate',
            entity: trend.page_url,
            message: `${trend.page_url} conversion rate has decreased by ${Math.abs(trend.trend * 100).toFixed(1)}% over the period`,
            data: trend
          });
        }
      }
      
      // Get traffic source performance
      const sourcePerformance = await this.getTrafficSourcePerformance(db, filters);
      
      // Generate insights based on traffic source performance
      for (const source of sourcePerformance) {
        if (source.conversion_rate > 0.1) {
          insights.push({
            type: 'positive',
            metric: 'source_performance',
            entity: source.utm_source || 'Direct',
            message: `${source.utm_source || 'Direct'} traffic has a high conversion rate of ${source.conversion_rate.toFixed(1)}%`,
            data: source
          });
        } else if (source.visit_count > 100 && source.conversion_rate < 0.02) {
          insights.push({
            type: 'opportunity',
            metric: 'source_performance',
            entity: source.utm_source || 'Direct',
            message: `${source.utm_source || 'Direct'} traffic has high volume but low conversion rate (${source.conversion_rate.toFixed(1)}%)`,
            data: source
          });
        }
      }
      
      // Detect potential anomalies in traffic patterns
      const trafficAnomalies = await this.detectTrafficAnomalies(db, filters);
      
      // Add anomaly insights
      for (const anomaly of trafficAnomalies) {
        const type = anomaly.change > 0 ? 'positive' : 'warning';
        insights.push({
          type,
          metric: 'traffic',
          entity: anomaly.date,
          message: `${type === 'positive' ? 'Unusual increase' : 'Unusual decrease'} in traffic detected on ${anomaly.date} (${Math.abs(anomaly.change_percent).toFixed(0)}% ${anomaly.change > 0 ? 'up' : 'down'})`,
          data: anomaly
        });
      }
      
      // Get behavioral patterns
      const behavioralPatterns = await this.detectBehavioralPatterns(db, filters);
      
      // Add behavioral insights
      for (const pattern of behavioralPatterns) {
        if (pattern.avg_time_on_page < 10 && pattern.bounce_rate > 0.7) {
          insights.push({
            type: 'warning',
            metric: 'engagement',
            entity: pattern.page_url,
            message: `Users spend very little time (${pattern.avg_time_on_page.toFixed(0)}s) on ${pattern.page_url} with high bounce rate (${(pattern.bounce_rate * 100).toFixed(0)}%)`,
            data: pattern
          });
        } else if (pattern.avg_time_on_page > 120 && pattern.scroll_depth > 0.8) {
          insights.push({
            type: 'positive',
            metric: 'engagement',
            entity: pattern.page_url,
            message: `High engagement detected on ${pattern.page_url} with ${pattern.avg_time_on_page.toFixed(0)}s time on page and ${(pattern.scroll_depth * 100).toFixed(0)}% scroll depth`,
            data: pattern
          });
        }
      }
      
      db.close();
      
      // Sort insights by importance (negative first, then opportunities, then positive)
      return insights.sort((a, b) => {
        const typeOrder = { negative: 0, warning: 1, opportunity: 2, positive: 3 };
        return typeOrder[a.type] - typeOrder[b.type];
      });
    } catch (error) {
      console.error('Error generating landing page insights:', error);
      throw error;
    }
  }
  
  /**
   * Get conversion rate trends for landing pages
   * @param {Object} db - Database connection
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} - Conversion rate trends
   */
  static async getConversionRateTrends(db, filters) {
    const { startDate, endDate, landingPages } = filters;
    
    // Default to 30 days if no dates provided
    const end = endDate ? moment(endDate) : moment();
    const start = startDate ? moment(startDate) : moment().subtract(30, 'days');
    
    // Calculate the halfway point to compare first half vs second half
    const midpoint = moment(start).add(moment(end).diff(start) / 2, 'milliseconds');
    
    let pageFilter = '';
    const params = [
      start.format('YYYY-MM-DD'), 
      midpoint.format('YYYY-MM-DD'),
      midpoint.format('YYYY-MM-DD'),
      end.format('YYYY-MM-DD')
    ];
    
    if (landingPages && landingPages.length > 0) {
      pageFilter = `AND pv.page_url IN (${landingPages.map(() => '?').join(',')})`;
      params.push(...landingPages, ...landingPages);
    }
    
    const query = `
      SELECT 
        t1.page_url,
        t1.first_half_rate,
        t2.second_half_rate,
        (t2.second_half_rate - t1.first_half_rate) as trend
      FROM (
        SELECT 
          pv.page_url,
          COUNT(c.id) * 1.0 / COUNT(pv.id) as first_half_rate
        FROM 
          page_visits pv
        LEFT JOIN 
          conversions c ON pv.id = c.visit_id
        WHERE 
          pv.is_landing_page = 1
          AND pv.visit_time BETWEEN ? AND ?
          ${pageFilter}
        GROUP BY 
          pv.page_url
      ) t1
      JOIN (
        SELECT 
          pv.page_url,
          COUNT(c.id) * 1.0 / COUNT(pv.id) as second_half_rate
        FROM 
          page_visits pv
        LEFT JOIN 
          conversions c ON pv.id = c.visit_id
        WHERE 
          pv.is_landing_page = 1
          AND pv.visit_time BETWEEN ? AND ?
          ${pageFilter}
        GROUP BY 
          pv.page_url
      ) t2 ON t1.page_url = t2.page_url
    `;
    
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
  
  /**
   * Get traffic source performance metrics
   * @param {Object} db - Database connection
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} - Traffic source performance data
   */
  static async getTrafficSourcePerformance(db, filters) {
    const { startDate, endDate } = filters;
    
    let dateFilter = '';
    const params = [];
    
    if (startDate) {
      dateFilter += ' AND pv.visit_time >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      dateFilter += ' AND pv.visit_time <= ?';
      params.push(endDate);
    }
    
    const query = `
      SELECT 
        pv.utm_source,
        COUNT(pv.id) as visit_count,
        COUNT(c.id) as conversion_count,
        COUNT(c.id) * 100.0 / COUNT(pv.id) as conversion_rate
      FROM 
        page_visits pv
      LEFT JOIN 
        conversions c ON pv.id = c.visit_id
      WHERE 
        pv.is_landing_page = 1
        ${dateFilter}
      GROUP BY 
        pv.utm_source
      HAVING 
        visit_count >= 10
      ORDER BY 
        conversion_rate DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
  
  /**
   * Detect anomalies in traffic patterns
   * @param {Object} db - Database connection
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} - Traffic anomalies
   */
  static async detectTrafficAnomalies(db, filters) {
    const { startDate, endDate } = filters;
    
    // Default to 30 days if no dates provided
    const end = endDate ? moment(endDate) : moment();
    const start = startDate ? moment(startDate) : moment().subtract(30, 'days');
    
    const query = `
      WITH daily_traffic AS (
        SELECT 
          date(pv.visit_time) as date,
          COUNT(pv.id) as visits
        FROM 
          page_visits pv
        WHERE 
          pv.is_landing_page = 1
          AND pv.visit_time BETWEEN ? AND ?
        GROUP BY 
          date(pv.visit_time)
      ),
      stats AS (
        SELECT 
          AVG(visits) as avg_visits,
          (SUM(visits * visits) / COUNT(visits) - (SUM(visits) / COUNT(visits)) * (SUM(visits) / COUNT(visits))) as variance
        FROM 
          daily_traffic
      )
      SELECT 
        dt.date,
        dt.visits,
        (SELECT avg_visits FROM stats) as avg_visits,
        dt.visits - (SELECT avg_visits FROM stats) as change,
        (dt.visits - (SELECT avg_visits FROM stats)) * 100.0 / (SELECT avg_visits FROM stats) as change_percent
      FROM 
        daily_traffic dt, stats
      WHERE 
        ABS(dt.visits - stats.avg_visits) > 2 * SQRT(stats.variance)
      ORDER BY 
        ABS(change_percent) DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.all(query, [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
  
  /**
   * Detect behavioral patterns on landing pages
   * @param {Object} db - Database connection
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} - Behavioral patterns
   */
  static async detectBehavioralPatterns(db, filters) {
    const { startDate, endDate, landingPages } = filters;
    
    let dateFilter = '';
    let pageFilter = '';
    const params = [];
    
    if (startDate) {
      dateFilter += ' AND pv.visit_time >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      dateFilter += ' AND pv.visit_time <= ?';
      params.push(endDate);
    }
    
    if (landingPages && landingPages.length > 0) {
      pageFilter = `AND pv.page_url IN (${landingPages.map(() => '?').join(',')})`;
      params.push(...landingPages);
    }
    
    const query = `
      SELECT 
        pv.page_url,
        AVG(pe.time_on_page) as avg_time_on_page,
        AVG(pe.scroll_depth) / 100.0 as scroll_depth,
        COUNT(CASE WHEN s.pages_viewed = 1 THEN 1 END) * 1.0 / COUNT(s.id) as bounce_rate,
        COUNT(pv.id) as visits
      FROM 
        page_visits pv
      LEFT JOIN 
        page_engagement pe ON pv.id = pe.visit_id
      LEFT JOIN 
        user_sessions s ON pv.session_id = s.session_id
      WHERE 
        pv.is_landing_page = 1
        ${dateFilter}
        ${pageFilter}
      GROUP BY 
        pv.page_url
      HAVING 
        visits >= 10
    `;
    
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
  
  /**
   * Get suggestions for optimization
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} - Optimization suggestions
   */
  static async getOptimizationSuggestions(filters = {}) {
    try {
      const insights = await this.generateLandingPageInsights(filters);
      const suggestions = [];
      
      // Generate suggestions based on insights
      for (const insight of insights) {
        switch (insight.type) {
          case 'negative':
          case 'warning':
            if (insight.metric === 'conversion_rate') {
              suggestions.push({
                priority: 'high',
                target: insight.entity,
                suggestion: `Review the conversion flow on ${insight.entity} to identify points of friction causing the ${Math.abs(insight.data.trend * 100).toFixed(1)}% decrease in conversion rate.`
              });
            } else if (insight.metric === 'engagement') {
              suggestions.push({
                priority: 'medium',
                target: insight.entity,
                suggestion: `Improve content engagement on ${insight.entity} to reduce bounce rate and increase time on page.`
              });
            }
            break;
            
          case 'opportunity':
            if (insight.metric === 'source_performance') {
              suggestions.push({
                priority: 'high',
                target: insight.entity,
                suggestion: `Optimize landing pages for ${insight.entity} traffic to improve the low conversion rate (${insight.data.conversion_rate.toFixed(1)}%).`
              });
            }
            break;
            
          case 'positive':
            if (insight.metric === 'source_performance' && insight.data.conversion_rate > 0.15) {
              suggestions.push({
                priority: 'medium',
                target: insight.entity,
                suggestion: `Consider increasing marketing budget for ${insight.entity} channel given its high conversion rate (${insight.data.conversion_rate.toFixed(1)}%).`
              });
            }
            break;
        }
      }
      
      return suggestions.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    } catch (error) {
      console.error('Error generating optimization suggestions:', error);
      throw error;
    }
  }
}

module.exports = AnalyticsInsightService; 