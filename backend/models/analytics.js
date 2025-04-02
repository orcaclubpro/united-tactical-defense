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
      const db = getDbConnection();
      
      return new Promise((resolve, reject) => {
        db.run(
          query, 
          [pageUrl, referrer, utmSource, utmMedium, utmCampaign, userAgent, ipAddress, isLandingPage ? 1 : 0],
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
        (COUNT(c.id) * 100.0 / COUNT(pv.id)) as conversion_rate
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
    
    if (whereConditions.length > 0) {
      query += " WHERE " + whereConditions.join(" AND ");
    }
    
    query += `
      GROUP BY 
        pv.page_url, pv.utm_source, pv.utm_medium, pv.utm_campaign
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
}

module.exports = Analytics; 