const { getDbConnection } = require('../config/database');

/**
 * Service for handling conversion attribution
 */
class AttributionService {
  /**
   * Attribute a conversion to the relevant page visits
   * @param {number} conversionId - ID of the conversion
   * @param {string} attributionModel - Model to use: 'first', 'last', 'linear', 'position'
   * @returns {Promise<Array>} - Attribution records
   */
  static async attributeConversion(conversionId, attributionModel = 'last') {
    try {
      const db = getDbConnection();

      // Get conversion details
      const conversion = await new Promise((resolve, reject) => {
        db.get(
          `SELECT c.*, pv.session_id 
           FROM conversions c
           JOIN page_visits pv ON c.visit_id = pv.id
           WHERE c.id = ?`,
          [conversionId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!conversion) {
        db.close();
        throw new Error(`Conversion with ID ${conversionId} not found`);
      }

      // Get all page visits in the same session leading up to the conversion
      const sessionVisits = await new Promise((resolve, reject) => {
        db.all(
          `SELECT pv.id, pv.page_url, pv.utm_source, pv.utm_medium, pv.utm_campaign, pv.visit_time
           FROM page_visits pv
           WHERE pv.session_id = ?
           AND pv.visit_time <= (SELECT conversion_time FROM conversions WHERE id = ?)
           ORDER BY pv.visit_time ASC`,
          [conversion.session_id, conversionId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      // If no previous visits found, just return
      if (sessionVisits.length === 0) {
        db.close();
        return [];
      }

      // Calculate attribution weights based on the selected model
      let attributions = [];
      switch (attributionModel) {
        case 'first':
          // 100% credit to the first touch
          attributions = [{ 
            visitId: sessionVisits[0].id, 
            weight: 1.0 
          }];
          break;
          
        case 'last':
          // 100% credit to the last touch
          attributions = [{ 
            visitId: sessionVisits[sessionVisits.length - 1].id, 
            weight: 1.0 
          }];
          break;
          
        case 'linear':
          // Equal credit to all touches
          const weight = 1.0 / sessionVisits.length;
          attributions = sessionVisits.map(visit => ({
            visitId: visit.id,
            weight: weight
          }));
          break;
          
        case 'position':
          // Position-based attribution (40% first, 40% last, 20% middle)
          if (sessionVisits.length === 1) {
            attributions = [{ visitId: sessionVisits[0].id, weight: 1.0 }];
          } else if (sessionVisits.length === 2) {
            attributions = [
              { visitId: sessionVisits[0].id, weight: 0.5 },
              { visitId: sessionVisits[1].id, weight: 0.5 }
            ];
          } else {
            // First touch gets 40%
            attributions.push({ visitId: sessionVisits[0].id, weight: 0.4 });
            
            // Last touch gets 40%
            attributions.push({ 
              visitId: sessionVisits[sessionVisits.length - 1].id, 
              weight: 0.4 
            });
            
            // Middle touches share 20%
            const middleWeight = 0.2 / (sessionVisits.length - 2);
            for (let i = 1; i < sessionVisits.length - 1; i++) {
              attributions.push({ 
                visitId: sessionVisits[i].id, 
                weight: middleWeight 
              });
            }
          }
          break;
          
        default:
          // Default to last-touch if model not recognized
          attributions = [{ 
            visitId: sessionVisits[sessionVisits.length - 1].id, 
            weight: 1.0 
          }];
      }

      // Store attributions in the database
      const attributionRecords = [];
      for (const attr of attributions) {
        const record = await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO attribution_events (
              conversion_id,
              visit_id,
              attribution_model,
              attribution_weight
            ) VALUES (?, ?, ?, ?)`,
            [conversionId, attr.visitId, attributionModel, attr.weight],
            function(err) {
              if (err) reject(err);
              else resolve({ 
                id: this.lastID, 
                conversionId, 
                visitId: attr.visitId, 
                model: attributionModel, 
                weight: attr.weight 
              });
            }
          );
        });
        attributionRecords.push(record);
      }

      db.close();
      return attributionRecords;
    } catch (error) {
      console.error('Error attributing conversion:', error);
      throw error;
    }
  }

  /**
   * Get attribution data for analysis
   * @param {Object} filters - Filter parameters
   * @param {string} filters.startDate - Start date
   * @param {string} filters.endDate - End date
   * @param {string} filters.attributionModel - Attribution model to analyze
   * @returns {Promise<Array>} - Attribution analysis data
   */
  static async getAttributionAnalysis(filters = {}) {
    const { startDate, endDate, attributionModel = 'last' } = filters;
    
    try {
      const db = getDbConnection();
      
      let query = `
        SELECT 
          pv.utm_source, 
          pv.utm_medium, 
          pv.utm_campaign,
          COUNT(DISTINCT ae.conversion_id) as conversion_count,
          SUM(ae.attribution_weight) as attribution_value
        FROM 
          attribution_events ae
        JOIN 
          page_visits pv ON ae.visit_id = pv.id
        JOIN 
          conversions c ON ae.conversion_id = c.id
        WHERE 
          ae.attribution_model = ?
      `;
      
      const params = [attributionModel];
      
      if (startDate) {
        query += ' AND c.conversion_time >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND c.conversion_time <= ?';
        params.push(endDate);
      }
      
      query += `
        GROUP BY 
          pv.utm_source, pv.utm_medium, pv.utm_campaign
        ORDER BY 
          attribution_value DESC
      `;
      
      const results = await new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      
      db.close();
      return results;
    } catch (error) {
      console.error('Error getting attribution analysis:', error);
      throw error;
    }
  }

  /**
   * Compare attribution models to see differences in credit assignment
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - Comparison of attribution models
   */
  static async compareAttributionModels(filters = {}) {
    const models = ['first', 'last', 'linear', 'position'];
    const results = {};
    
    for (const model of models) {
      results[model] = await this.getAttributionAnalysis({
        ...filters,
        attributionModel: model
      });
    }
    
    return results;
  }
}

module.exports = AttributionService; 