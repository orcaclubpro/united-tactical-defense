const db = require('../config/database');
const Analytics = require('../models/analytics');

class LandingPageMetricsService {
  /**
   * Track a new landing page visit
   * @param {Object} data - Visit data
   * @param {string} data.pageUrl - URL of the landing page
   * @param {string} data.referrer - Referrer URL
   * @param {string} data.utmSource - UTM source parameter
   * @param {string} data.utmMedium - UTM medium parameter
   * @param {string} data.utmCampaign - UTM campaign parameter
   * @param {string} data.userAgent - User agent string
   * @param {string} data.ipAddress - IP address of visitor
   * @returns {Promise<Object>} - Result with visitId
   */
  static async trackLandingPageVisit(data) {
    return await Analytics.trackVisit({
      ...data,
      isLandingPage: true
    });
  }

  /**
   * Get landing page performance metrics
   * @param {Object} filters - Filter parameters
   * @param {string} filters.startDate - Start date for the report
   * @param {string} filters.endDate - End date for the report
   * @param {string} filters.utmSource - Filter by UTM source
   * @param {Array<string>} filters.landingPages - Array of landing page URLs to include
   * @returns {Promise<Array>} - Array of landing page metrics
   */
  static async getLandingPageMetrics(filters = {}) {
    try {
      // Set default landing page if not specified
      if (!filters.landingPages || filters.landingPages.length === 0) {
        filters.landingPages = ['/'];
      }

      // Get base analytics data
      const baseData = await Analytics.getAnalyticsReport({
        ...filters,
        isLandingPage: true
      });

      // Enhance with additional landing page metrics
      const enhancedData = await this.enrichWithLandingPageMetrics(baseData, filters);
      
      return enhancedData;
    } catch (error) {
      console.error('Error generating landing page metrics:', error);
      throw error;
    }
  }

  /**
   * Enrich analytics data with landing page specific metrics
   * @param {Array} baseData - Base analytics data
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} - Enhanced data with landing page metrics
   */
  static async enrichWithLandingPageMetrics(baseData, filters) {
    try {
      // Calculate bounce rate
      const bounceQuery = `
        SELECT 
          pv.page_url,
          COUNT(CASE WHEN (
            SELECT COUNT(*) FROM page_visits pv2 
            WHERE pv2.ip_address = pv.ip_address 
            AND pv2.visit_time BETWEEN datetime(pv.visit_time) AND datetime(pv.visit_time, '+30 minutes')
          ) = 1 THEN 1 ELSE NULL END) as bounce_count,
          COUNT(pv.id) as total_visits
        FROM 
          page_visits pv
        WHERE 
          pv.page_url IN (${filters.landingPages.map(() => '?').join(',')})
          ${filters.startDate ? "AND pv.visit_time >= ?" : ""}
          ${filters.endDate ? "AND pv.visit_time <= ?" : ""}
        GROUP BY 
          pv.page_url
      `;

      const bounceParams = [
        ...filters.landingPages,
        ...(filters.startDate ? [filters.startDate] : []),
        ...(filters.endDate ? [filters.endDate] : [])
      ];
      
      const bounceData = await db.all(bounceQuery, bounceParams);
      
      // Calculate average session duration
      const durationQuery = `
        SELECT 
          pv.page_url,
          AVG(pe.time_on_page) as avg_session_duration
        FROM 
          page_visits pv
        LEFT JOIN 
          page_engagement pe ON pv.id = pe.visit_id
        WHERE 
          pv.page_url IN (${filters.landingPages.map(() => '?').join(',')})
          ${filters.startDate ? "AND pv.visit_time >= ?" : ""}
          ${filters.endDate ? "AND pv.visit_time <= ?" : ""}
        GROUP BY 
          pv.page_url
      `;
      
      const durationParams = [
        ...filters.landingPages,
        ...(filters.startDate ? [filters.startDate] : []),
        ...(filters.endDate ? [filters.endDate] : [])
      ];
      
      const durationData = await db.all(durationQuery, durationParams);
      
      // Merge and return enhanced data
      return baseData.map(item => {
        const bounceInfo = bounceData.find(b => b.page_url === item.page_url) || { bounce_count: 0, total_visits: 0 };
        const durationInfo = durationData.find(d => d.page_url === item.page_url) || { avg_session_duration: 0 };
        
        return {
          ...item,
          bounce_rate: bounceInfo.total_visits > 0 
            ? (bounceInfo.bounce_count / bounceInfo.total_visits * 100).toFixed(2) 
            : 0,
          avg_session_duration: durationInfo.avg_session_duration || 0
        };
      });
    } catch (error) {
      console.error('Error enriching landing page metrics:', error);
      throw error;
    }
  }

  /**
   * Get top performing traffic sources for landing pages
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} - Array of top traffic sources
   */
  static async getTopTrafficSources(filters = {}) {
    const query = `
      SELECT 
        pv.utm_source,
        pv.utm_medium,
        pv.utm_campaign,
        COUNT(pv.id) as visit_count,
        COUNT(c.id) as conversion_count,
        (COUNT(c.id) * 100.0 / COUNT(pv.id)) as conversion_rate
      FROM 
        page_visits pv
      LEFT JOIN 
        conversions c ON pv.id = c.visit_id
      WHERE 
        pv.page_url IN (${filters.landingPages.map(() => '?').join(',')})
        ${filters.startDate ? "AND pv.visit_time >= ?" : ""}
        ${filters.endDate ? "AND pv.visit_time <= ?" : ""}
      GROUP BY 
        pv.utm_source, pv.utm_medium, pv.utm_campaign
      ORDER BY 
        visit_count DESC
      LIMIT 10
    `;
    
    const params = [
      ...filters.landingPages,
      ...(filters.startDate ? [filters.startDate] : []),
      ...(filters.endDate ? [filters.endDate] : [])
    ];
    
    try {
      return await db.all(query, params);
    } catch (error) {
      console.error('Error getting top traffic sources:', error);
      throw error;
    }
  }
}

module.exports = LandingPageMetricsService; 