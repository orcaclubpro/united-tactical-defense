/**
 * Analytics Repository Implementation
 */

const { AnalyticsRepositoryInterface } = require('../../core/interfaces/repositories');
const { Analytics } = require('../../core/entities');
const { createError } = require('../../api/middleware/errorHandler');

class AnalyticsRepository extends AnalyticsRepositoryInterface {
  /**
   * Constructor
   * @param {Object} db - Database connection
   */
  constructor(db) {
    super();
    this.db = db;
  }

  /**
   * Find analytics entry by ID
   * @param {string|number} id - Analytics ID
   * @returns {Promise<Analytics|null>} - Analytics or null if not found
   */
  async findById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM analytics WHERE id = ?',
        [id],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(null);
          
          // Parse data JSON field
          try {
            if (row.data) {
              row.data = JSON.parse(row.data);
            }
          } catch (e) {
            console.error('Error parsing analytics data JSON:', e);
            row.data = {};
          }
          
          resolve(new Analytics(row));
        }
      );
    });
  }

  /**
   * Find analytics by type
   * @param {string} type - Analytics type (event or pageView)
   * @returns {Promise<Array<Analytics>>} - Array of analytics entries
   */
  async findByType(type) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM analytics WHERE type = ? ORDER BY timestamp DESC',
        [type],
        (err, rows) => {
          if (err) return reject(err);
          
          // Parse data JSON field for each row
          rows.forEach(row => {
            try {
              if (row.data) {
                row.data = JSON.parse(row.data);
              }
            } catch (e) {
              console.error('Error parsing analytics data JSON:', e);
              row.data = {};
            }
          });
          
          resolve(rows.map(row => new Analytics(row)));
        }
      );
    });
  }
  
  /**
   * Find events by event type
   * @param {string} eventType - Event type
   * @returns {Promise<Array<Analytics>>} - Array of events
   */
  async findByEventType(eventType) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM analytics WHERE type = "event" AND eventType = ? ORDER BY timestamp DESC',
        [eventType],
        (err, rows) => {
          if (err) return reject(err);
          
          // Parse data JSON field for each row
          rows.forEach(row => {
            try {
              if (row.data) {
                row.data = JSON.parse(row.data);
              }
            } catch (e) {
              console.error('Error parsing analytics data JSON:', e);
              row.data = {};
            }
          });
          
          resolve(rows.map(row => new Analytics(row)));
        }
      );
    });
  }
  
  /**
   * Find analytics by user
   * @param {string|number} userId - User ID
   * @returns {Promise<Array<Analytics>>} - Array of analytics entries
   */
  async findByUser(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM analytics WHERE userId = ? ORDER BY timestamp DESC',
        [userId],
        (err, rows) => {
          if (err) return reject(err);
          
          // Parse data JSON field for each row
          rows.forEach(row => {
            try {
              if (row.data) {
                row.data = JSON.parse(row.data);
              }
            } catch (e) {
              console.error('Error parsing analytics data JSON:', e);
              row.data = {};
            }
          });
          
          resolve(rows.map(row => new Analytics(row)));
        }
      );
    });
  }
  
  /**
   * Find analytics by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array<Analytics>>} - Array of analytics entries
   */
  async findByDateRange(startDate, endDate) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM analytics WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
        [startDate.toISOString(), endDate.toISOString()],
        (err, rows) => {
          if (err) return reject(err);
          
          // Parse data JSON field for each row
          rows.forEach(row => {
            try {
              if (row.data) {
                row.data = JSON.parse(row.data);
              }
            } catch (e) {
              console.error('Error parsing analytics data JSON:', e);
              row.data = {};
            }
          });
          
          resolve(rows.map(row => new Analytics(row)));
        }
      );
    });
  }

  /**
   * Find all analytics entries with optional filtering
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Array<Analytics>>} - Array of analytics entries
   */
  async findAll(filter = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM analytics';
      const params = [];

      // Apply filters if provided
      if (Object.keys(filter).length > 0) {
        const conditions = [];
        
        if (filter.type) {
          conditions.push('type = ?');
          params.push(filter.type);
        }
        
        if (filter.eventType) {
          conditions.push('eventType = ?');
          params.push(filter.eventType);
        }
        
        if (filter.userId) {
          conditions.push('userId = ?');
          params.push(filter.userId);
        }
        
        if (filter.sessionId) {
          conditions.push('sessionId = ?');
          params.push(filter.sessionId);
        }
        
        if (filter.startDate) {
          conditions.push('timestamp >= ?');
          params.push(filter.startDate.toISOString());
        }
        
        if (filter.endDate) {
          conditions.push('timestamp <= ?');
          params.push(filter.endDate.toISOString());
        }
        
        if (conditions.length > 0) {
          query += ` WHERE ${conditions.join(' AND ')}`;
        }
      }
      
      // Add ordering
      query += ' ORDER BY timestamp DESC';
      
      // Add limit if specified
      if (filter.limit) {
        query += ' LIMIT ?';
        params.push(filter.limit);
      }
      
      this.db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        
        // Parse data JSON field for each row
        rows.forEach(row => {
          try {
            if (row.data) {
              row.data = JSON.parse(row.data);
            }
          } catch (e) {
            console.error('Error parsing analytics data JSON:', e);
            row.data = {};
          }
        });
        
        resolve(rows.map(row => new Analytics(row)));
      });
    });
  }

  /**
   * Create a new analytics entry
   * @param {Analytics} analytics - Analytics entity
   * @returns {Promise<Analytics>} - Created analytics entry
   */
  async create(analytics) {
    return new Promise((resolve, reject) => {
      const { type, eventType, userId, sessionId, data, ipAddress, userAgent, timestamp, createdAt } = analytics;
      
      // Stringify data object
      const dataJson = JSON.stringify(data || {});
      
      this.db.run(
        `INSERT INTO analytics (type, eventType, userId, sessionId, data, ipAddress, userAgent, timestamp, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          type,
          eventType,
          userId,
          sessionId,
          dataJson,
          ipAddress,
          userAgent,
          timestamp.toISOString(),
          createdAt.toISOString()
        ],
        function(err) {
          if (err) return reject(err);
          
          // Get the created analytics entry
          this.db.get(
            'SELECT * FROM analytics WHERE id = ?',
            [this.lastID],
            (err, row) => {
              if (err) return reject(err);
              
              // Parse data JSON field
              try {
                if (row.data) {
                  row.data = JSON.parse(row.data);
                }
              } catch (e) {
                console.error('Error parsing analytics data JSON:', e);
                row.data = {};
              }
              
              resolve(new Analytics(row));
            }
          );
        }.bind(this)
      );
    });
  }

  /**
   * Update an existing analytics entry (rarely used)
   * @param {string|number} id - Analytics ID
   * @param {Object} data - Updated analytics data
   * @returns {Promise<Analytics>} - Updated analytics entry
   */
  async update(id, data) {
    return new Promise((resolve, reject) => {
      // Analytics entries are typically immutable, but provide update for completeness
      reject(createError(
        'NOT_IMPLEMENTED_ERROR',
        'Analytics entries are immutable and cannot be updated'
      ));
    });
  }

  /**
   * Delete an analytics entry
   * @param {string|number} id - Analytics ID
   * @returns {Promise<boolean>} - Success flag
   */
  async delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM analytics WHERE id = ?',
        [id],
        function(err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  }
  
  /**
   * Get user activity report
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string|number} userId - Optional user ID to filter by
   * @param {number} limit - Optional result limit
   * @returns {Promise<Object>} - Report data
   */
  async getUserActivityReport(startDate, endDate, userId, limit) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          DATE(timestamp) as day,
          COUNT(*) as count,
          type,
          eventType,
          userId
        FROM analytics
        WHERE timestamp BETWEEN ? AND ?
      `;
      
      const params = [startDate.toISOString(), endDate.toISOString()];
      
      if (userId) {
        query += ' AND userId = ?';
        params.push(userId);
      }
      
      query += ' GROUP BY day, type, eventType';
      query += ' ORDER BY day DESC, count DESC';
      
      if (limit) {
        query += ' LIMIT ?';
        params.push(limit);
      }
      
      this.db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        
        // Transform results for easier consumption
        const resultsByDay = {};
        
        rows.forEach(row => {
          if (!resultsByDay[row.day]) {
            resultsByDay[row.day] = {
              day: row.day,
              total: 0,
              pageViews: 0,
              events: {}
            };
          }
          
          if (row.type === 'pageView') {
            resultsByDay[row.day].pageViews += row.count;
          } else if (row.type === 'event' && row.eventType) {
            resultsByDay[row.day].events[row.eventType] = (resultsByDay[row.day].events[row.eventType] || 0) + row.count;
          }
          
          resultsByDay[row.day].total += row.count;
        });
        
        resolve({
          timeframe: {
            start: startDate,
            end: endDate
          },
          userId: userId || 'all',
          activities: Object.values(resultsByDay)
        });
      });
    });
  }
  
  /**
   * Get page views report
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} groupBy - Group by field (path, referrer, day, etc.)
   * @param {number} limit - Optional result limit
   * @returns {Promise<Object>} - Report data
   */
  async getPageViewsReport(startDate, endDate, groupBy, limit) {
    return new Promise((resolve, reject) => {
      let groupByField = 'day';
      let selectField = 'DATE(timestamp) as day';
      
      // If grouping by a data field, we need to use JSON extraction
      if (['path', 'referrer', 'userAgent'].includes(groupBy)) {
        groupByField = `json_extract(data, '$.${groupBy}')`;
        selectField = `json_extract(data, '$.${groupBy}') as ${groupBy}`;
      }
      
      let query = `
        SELECT 
          ${selectField},
          COUNT(*) as count
        FROM analytics
        WHERE timestamp BETWEEN ? AND ? AND type = 'pageView'
        GROUP BY ${groupByField}
        ORDER BY count DESC
      `;
      
      const params = [startDate.toISOString(), endDate.toISOString()];
      
      if (limit) {
        query += ' LIMIT ?';
        params.push(limit);
      }
      
      this.db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        
        resolve({
          timeframe: {
            start: startDate,
            end: endDate
          },
          groupBy,
          pageViews: rows
        });
      });
    });
  }
  
  /**
   * Get events report
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} eventType - Optional event type to filter by
   * @param {string} groupBy - Group by field (eventType, day, etc.)
   * @param {number} limit - Optional result limit
   * @returns {Promise<Object>} - Report data
   */
  async getEventsReport(startDate, endDate, eventType, groupBy, limit) {
    return new Promise((resolve, reject) => {
      let groupByField = 'day';
      let selectField = 'DATE(timestamp) as day';
      
      if (groupBy === 'eventType') {
        groupByField = 'eventType';
        selectField = 'eventType';
      }
      
      let query = `
        SELECT 
          ${selectField},
          COUNT(*) as count
        FROM analytics
        WHERE timestamp BETWEEN ? AND ? AND type = 'event'
      `;
      
      const params = [startDate.toISOString(), endDate.toISOString()];
      
      if (eventType) {
        query += ' AND eventType = ?';
        params.push(eventType);
      }
      
      query += ` GROUP BY ${groupByField}`;
      query += ' ORDER BY count DESC';
      
      if (limit) {
        query += ' LIMIT ?';
        params.push(limit);
      }
      
      this.db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        
        resolve({
          timeframe: {
            start: startDate,
            end: endDate
          },
          eventType: eventType || 'all',
          groupBy,
          events: rows
        });
      });
    });
  }
  
  /**
   * Get conversion report
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} conversionGoal - Conversion goal event type
   * @param {number} limit - Optional result limit
   * @returns {Promise<Object>} - Report data
   */
  async getConversionReport(startDate, endDate, conversionGoal, limit) {
    return new Promise((resolve, reject) => {
      // First, count total sessions
      this.db.get(
        `SELECT COUNT(DISTINCT sessionId) as totalSessions
         FROM analytics
         WHERE timestamp BETWEEN ? AND ?`,
        [startDate.toISOString(), endDate.toISOString()],
        (err, totalResult) => {
          if (err) return reject(err);
          
          // Then, count sessions with conversion goal
          this.db.get(
            `SELECT COUNT(DISTINCT sessionId) as convertedSessions
             FROM analytics
             WHERE timestamp BETWEEN ? AND ?
             AND type = 'event'
             AND eventType = ?`,
            [startDate.toISOString(), endDate.toISOString(), conversionGoal],
            (err, conversionResult) => {
              if (err) return reject(err);
              
              // Get detailed conversion paths (most common)
              let query = `
                WITH session_paths AS (
                  SELECT 
                    sessionId,
                    GROUP_CONCAT(
                      CASE
                        WHEN type = 'pageView' THEN json_extract(data, '$.path')
                        WHEN type = 'event' THEN eventType
                        ELSE NULL
                      END, ' → '
                    ) as path
                  FROM (
                    SELECT *
                    FROM analytics
                    WHERE timestamp BETWEEN ? AND ?
                    ORDER BY sessionId, timestamp
                  )
                  GROUP BY sessionId
                )
                SELECT path, COUNT(*) as count
                FROM session_paths
                GROUP BY path
                ORDER BY count DESC
              `;
              
              const params = [startDate.toISOString(), endDate.toISOString()];
              
              if (limit) {
                query += ' LIMIT ?';
                params.push(limit);
              }
              
              this.db.all(query, params, (err, pathRows) => {
                if (err) return reject(err);
                
                const totalSessions = totalResult.totalSessions || 0;
                const convertedSessions = conversionResult.convertedSessions || 0;
                const conversionRate = totalSessions > 0 ? (convertedSessions / totalSessions) * 100 : 0;
                
                resolve({
                  timeframe: {
                    start: startDate,
                    end: endDate
                  },
                  conversionGoal,
                  totalSessions,
                  convertedSessions,
                  conversionRate: conversionRate.toFixed(2) + '%',
                  conversionPaths: pathRows
                });
              });
            }
          );
        }
      );
    });
  }
  
  /**
   * Delete analytics older than specified date
   * @param {Date} date - Date threshold
   * @returns {Promise<number>} - Number of deleted records
   */
  async deleteOlderThan(date) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM analytics WHERE timestamp < ?',
        [date.toISOString()],
        function(err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  }
}

module.exports = AnalyticsRepository; 