const { getDbConnection } = require('../config/database');
const crypto = require('crypto');
const moment = require('moment');

/**
 * Service for tracking user sessions
 */
class SessionTrackingService {
  /**
   * Generate a new session ID
   * @returns {string} - Unique session ID
   */
  static generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Create a visitor ID based on IP and user agent
   * @param {string} ipAddress - User IP address
   * @param {string} userAgent - User agent string
   * @returns {string} - Hashed visitor ID
   */
  static generateVisitorId(ipAddress, userAgent) {
    const input = `${ipAddress}|${userAgent}`;
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  /**
   * Creates or continues a user session
   * @param {number} visitId - The ID of the current page visit
   * @param {string} ipAddress - User IP address
   * @param {string} userAgent - User agent string
   * @param {string} existingSessionId - Optional existing session ID
   * @returns {Promise<Object>} - Session information
   */
  static async trackSession(visitId, ipAddress, userAgent, existingSessionId = null) {
    try {
      const visitorId = this.generateVisitorId(ipAddress, userAgent);
      const db = getDbConnection();

      // Check if this is a continuation of an existing session
      if (existingSessionId) {
        const sessionQuery = `
          SELECT * FROM user_sessions 
          WHERE session_id = ? AND visitor_id = ?
          AND start_time >= datetime('now', '-1 hours')
        `;
        
        const existingSession = await new Promise((resolve, reject) => {
          db.get(sessionQuery, [existingSessionId, visitorId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });

        if (existingSession) {
          // Update existing session
          await new Promise((resolve, reject) => {
            db.run(
              `UPDATE user_sessions 
               SET end_time = datetime('now'),
                   session_duration = ROUND((julianday('now') - julianday(start_time)) * 24 * 60 * 60),
                   pages_viewed = pages_viewed + 1
               WHERE session_id = ?`,
              [existingSessionId],
              function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
              }
            );
          });

          // Update page visit with session info
          await new Promise((resolve, reject) => {
            db.run(
              `UPDATE page_visits SET session_id = ? WHERE id = ?`,
              [existingSessionId, visitId],
              function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
              }
            );
          });

          db.close();
          return { 
            sessionId: existingSessionId, 
            isNewSession: false, 
            visitorId 
          };
        }
      }

      // Create new session
      const sessionId = this.generateSessionId();
      
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO user_sessions (
            session_id, 
            first_visit_id, 
            visitor_id, 
            start_time, 
            end_time, 
            pages_viewed
          ) VALUES (?, ?, ?, datetime('now'), datetime('now'), 1)`,
          [sessionId, visitId, visitorId],
          function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
          }
        );
      });

      // Update page visit with session info
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE page_visits SET session_id = ? WHERE id = ?`,
          [sessionId, visitId],
          function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
          }
        );
      });

      db.close();
      return { 
        sessionId, 
        isNewSession: true, 
        visitorId 
      };
    } catch (error) {
      console.error('Error tracking session:', error);
      throw error;
    }
  }

  /**
   * End a user session
   * @param {string} sessionId - The session ID to end
   * @returns {Promise<Object>} - Result object
   */
  static async endSession(sessionId) {
    try {
      const db = getDbConnection();
      
      const result = await new Promise((resolve, reject) => {
        db.run(
          `UPDATE user_sessions 
           SET end_time = datetime('now'),
               session_duration = ROUND((julianday('now') - julianday(start_time)) * 24 * 60 * 60)
           WHERE session_id = ?`,
          [sessionId],
          function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
          }
        );
      });

      db.close();
      return result;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  /**
   * Get session details
   * @param {string} sessionId - The session ID to retrieve
   * @returns {Promise<Object|null>} - Session object or null
   */
  static async getSession(sessionId) {
    try {
      const db = getDbConnection();
      
      const session = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM user_sessions WHERE session_id = ?`,
          [sessionId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      db.close();
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  /**
   * Get a visitor's history (all sessions)
   * @param {string} visitorId - The visitor ID
   * @param {number} limit - Maximum number of sessions to retrieve
   * @returns {Promise<Array>} - Array of session objects
   */
  static async getVisitorSessions(visitorId, limit = 10) {
    try {
      const db = getDbConnection();
      
      const sessions = await new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM user_sessions 
           WHERE visitor_id = ? 
           ORDER BY start_time DESC 
           LIMIT ?`,
          [visitorId, limit],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      db.close();
      return sessions;
    } catch (error) {
      console.error('Error getting visitor sessions:', error);
      throw error;
    }
  }
}

module.exports = SessionTrackingService; 