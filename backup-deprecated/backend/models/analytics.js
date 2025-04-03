const { getDbConnection } = require('../config/database');

class Analytics {
  // Track page visit with source information
  static async trackVisit(data) {
    const { 
      pageUrl, 
      referrer, 
      utmSource, 
      utmMedium, 
      utmCampaign, 
      userAgent, 
      ipAddress,
      isLandingPage
    } = data;
    
    const query = `
      INSERT INTO page_visits (
        page_url, 
        referrer, 
        utm_source, 
        utm_medium, 
        utm_campaign, 
        user_agent, 
        ip_address,
        is_landing_page,
        visit_time
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    
    try {
      console.log('Tracking page visit for:', pageUrl);
      
      const db = getDbConnection();
      console.log('Database connection established');
      
      return new Promise((resolve, reject) => {
        db.run(
          query, 
          [
            pageUrl, 
            referrer, 
            utmSource, 
            utmMedium, 
            utmCampaign, 
            userAgent, 
            ipAddress, 
            isLandingPage ? 1 : 0
          ],
          function(err) {
            console.log('Query executed. Error:', err, 'Last ID:', this.lastID);
            
            if (err) {
              db.close();
              console.log('Database connection closed after error');
              reject(err);
            } else {
              const visitId = this.lastID;
              db.close();
              console.log('Database connection closed successfully. Visit ID:', visitId);
              resolve({ lastID: visitId, changes: this.changes });
            }
          }
        );
      });
    } catch (error) {
      console.error('Error tracking visit:', error);
      throw error;
    }
  }

  // Track user engagement (time spent, scroll depth, etc.)
  static async trackEngagement(data) {
    const { 
      visitId, 
      timeOnPage, 
      scrollDepth, 
      clickCount, 
      formInteractions 
    } = data;
    
    const query = `
      INSERT INTO page_engagement (
        visit_id, 
        time_on_page, 
        scroll_depth, 
        click_count, 
        form_interactions, 
        engagement_time
      ) 
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `;
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.run(
          query, 
          [visitId, timeOnPage, scrollDepth, clickCount, formInteractions],
          function(err) {
            db.close();
            if (err) {
              reject(err);
            } else {
              resolve({ lastID: this.lastID, changes: this.changes });
            }
          }
        );
      });
    } catch (error) {
      console.error('Error tracking engagement:', error);
      throw error;
    }
  }

  // Track conversion events (form submissions, button clicks)
  static async trackConversion(data) {
    const { 
      visitId, 
      conversionType, 
      conversionValue, 
      conversionData 
    } = data;
    
    const query = `
      INSERT INTO conversions (
        visit_id, 
        conversion_type, 
        conversion_value, 
        conversion_data, 
        conversion_time
      ) 
      VALUES (?, ?, ?, ?, datetime('now'))
    `;
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.run(
          query, 
          [visitId, conversionType, conversionValue, JSON.stringify(conversionData)],
          function(err) {
            db.close();
            if (err) {
              reject(err);
            } else {
              resolve({ lastID: this.lastID, changes: this.changes });
            }
          }
        );
      });
    } catch (error) {
      console.error('Error tracking conversion:', error);
      throw error;
    }
  }

  // Get analytics reports
  static async getAnalyticsReport(filters = {}) {
    let query = `
      SELECT 
        pv.page_url,
        COUNT(pv.id) as visit_count,
        pv.utm_source,
        pv.utm_medium,
        pv.utm_campaign,
        AVG(pe.time_on_page) as avg_time_on_page,
        AVG(pe.scroll_depth) as avg_scroll_depth,
        COUNT(c.id) as conversion_count,
        (COUNT(c.id) * 100.0 / COUNT(pv.id)) as conversion_rate,
        COUNT(DISTINCT pv.session_id) as unique_sessions,
        pv.device_type,
        pv.browser,
        pv.country
      FROM 
        page_visits pv
      LEFT JOIN 
        page_engagement pe ON pv.id = pe.visit_id
      LEFT JOIN 
        conversions c ON pv.id = c.visit_id
    `;
    
    const whereConditions = [];
    const params = [];
    
    if (filters.startDate) {
      whereConditions.push("pv.visit_time >= ?");
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      whereConditions.push("pv.visit_time <= ?");
      params.push(filters.endDate);
    }
    
    if (filters.utmSource) {
      whereConditions.push("pv.utm_source = ?");
      params.push(filters.utmSource);
    }
    
    if (filters.pageUrl) {
      whereConditions.push("pv.page_url = ?");
      params.push(filters.pageUrl);
    }

    if (filters.isLandingPage !== undefined) {
      whereConditions.push("pv.is_landing_page = ?");
      params.push(filters.isLandingPage ? 1 : 0);
    }

    if (filters.deviceType) {
      whereConditions.push("pv.device_type = ?");
      params.push(filters.deviceType);
    }

    if (filters.country) {
      whereConditions.push("pv.country = ?");
      params.push(filters.country);
    }

    if (filters.isBot !== undefined) {
      whereConditions.push("pv.is_bot = ?");
      params.push(filters.isBot ? 1 : 0);
    }
    
    if (whereConditions.length > 0) {
      query += " WHERE " + whereConditions.join(" AND ");
    }
    
    query += `
      GROUP BY 
        pv.page_url, pv.utm_source, pv.utm_medium, pv.utm_campaign, pv.device_type, pv.browser, pv.country
      ORDER BY 
        visit_count DESC
    `;
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    } catch (error) {
      console.error('Error generating analytics report:', error);
      throw error;
    }
  }

  // Get device breakdown for visits
  static async getDeviceBreakdown(filters = {}) {
    let query = `
      SELECT 
        device_type,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM page_visits WHERE is_bot = 0), 2) as percentage
      FROM 
        page_visits
      WHERE 
        is_bot = 0
    `;
    
    const whereConditions = [];
    const params = [];
    
    if (filters.startDate) {
      whereConditions.push("visit_time >= ?");
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      whereConditions.push("visit_time <= ?");
      params.push(filters.endDate);
    }
    
    if (filters.isLandingPage !== undefined) {
      whereConditions.push("is_landing_page = ?");
      params.push(filters.isLandingPage ? 1 : 0);
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
            resolve(rows);
          }
        });
      });
    } catch (error) {
      console.error('Error getting device breakdown:', error);
      throw error;
    }
  }

  // Get geographic distribution of visitors
  static async getGeographicDistribution(filters = {}) {
    let query = `
      SELECT 
        country,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM page_visits WHERE country IS NOT NULL AND is_bot = 0), 2) as percentage
      FROM 
        page_visits
      WHERE 
        country IS NOT NULL
        AND is_bot = 0
    `;
    
    const whereConditions = [];
    const params = [];
    
    if (filters.startDate) {
      whereConditions.push("visit_time >= ?");
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      whereConditions.push("visit_time <= ?");
      params.push(filters.endDate);
    }
    
    if (filters.isLandingPage !== undefined) {
      whereConditions.push("is_landing_page = ?");
      params.push(filters.isLandingPage ? 1 : 0);
    }
    
    if (whereConditions.length > 0) {
      query += " AND " + whereConditions.join(" AND ");
    }
    
    query += `
      GROUP BY 
        country
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
            resolve(rows);
          }
        });
      });
    } catch (error) {
      console.error('Error getting geographic distribution:', error);
      throw error;
    }
  }

  // Get new vs returning visitor metrics
  static async getNewVsReturningMetrics(filters = {}) {
    let query = `
      WITH visitor_sessions AS (
        SELECT 
          s.visitor_id,
          MIN(s.start_time) as first_visit,
          COUNT(s.id) as session_count
        FROM 
          user_sessions s
        JOIN 
          page_visits pv ON s.first_visit_id = pv.id
        WHERE 
          pv.is_bot = 0
          ${filters.startDate ? "AND s.start_time >= ?" : ""}
          ${filters.endDate ? "AND s.start_time <= ?" : ""}
          ${filters.isLandingPage !== undefined ? "AND pv.is_landing_page = ?" : ""}
        GROUP BY 
          s.visitor_id
      )
      SELECT 
        COUNT(CASE WHEN session_count = 1 THEN 1 END) as new_visitors,
        COUNT(CASE WHEN session_count > 1 THEN 1 END) as returning_visitors,
        ROUND(COUNT(CASE WHEN session_count = 1 THEN 1 END) * 100.0 / COUNT(*), 2) as new_percentage,
        ROUND(COUNT(CASE WHEN session_count > 1 THEN 1 END) * 100.0 / COUNT(*), 2) as returning_percentage
      FROM 
        visitor_sessions
    `;
    
    const params = [];
    
    if (filters.startDate) params.push(filters.startDate);
    if (filters.endDate) params.push(filters.endDate);
    if (filters.isLandingPage !== undefined) params.push(filters.isLandingPage ? 1 : 0);
    
    try {
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    } catch (error) {
      console.error('Error getting new vs returning metrics:', error);
      throw error;
    }
  }
}

module.exports = Analytics; 