const Analytics = require('../models/analytics');
const LandingPageMetricsService = require('../services/landingPageMetricsService');
const SessionTrackingService = require('../services/sessionTrackingService');
const AttributionService = require('../services/attributionService');
const AnalyticsInsightService = require('../services/analyticsInsightService');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const metricTrackingService = require('../services/metricTrackingService');

// Helper function to extract device info from user agent
const getDeviceInfo = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    deviceType: result.device.type || 'desktop',
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`
  };
};

// Helper function to detect if the user agent is a bot
const isBot = (userAgent) => {
  if (!userAgent) return false;
  
  const botPatterns = [
    'bot', 'crawler', 'spider', 'slurp', 'googlebot', 'bingbot', 'yandex',
    'baidu', 'facebookexternalhit', 'linkedinbot', 'twitterbot'
  ];
  
  const lowerUA = userAgent.toLowerCase();
  return botPatterns.some(pattern => lowerUA.includes(pattern));
};

// Helper function to get geographic info from IP
const getGeoInfo = (ipAddress) => {
  // Remove IPv6 prefix if exists
  const cleanIP = ipAddress.replace(/^::ffff:/, '');
  
  // Check if local IP or testing environment
  if (cleanIP === '127.0.0.1' || cleanIP === 'localhost' || cleanIP.startsWith('192.168.')) {
    return {
      country: null,
      region: null,
      city: null
    };
  }
  
  const geo = geoip.lookup(cleanIP);
  
  if (!geo) {
    return {
      country: null,
      region: null,
      city: null
    };
  }
  
  return {
    country: geo.country,
    region: geo.region,
    city: geo.city
  };
};

exports.trackPageVisit = async (req, res) => {
  try {
    const { 
      pageUrl, 
      referrer, 
      utmSource, 
      utmMedium, 
      utmCampaign,
      isLandingPage = false
    } = req.body;
    
    // Get IP and user agent
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress || 
                     req.connection.socket.remoteAddress;
    
    const visitData = {
      pageUrl, 
      referrer, 
      utmSource, 
      utmMedium, 
      utmCampaign, 
      userAgent, 
      ipAddress,
      isLandingPage: isLandingPage
    };
    
    // Track the visit
    const result = await Analytics.trackVisit(visitData);
    
    // Return visit ID
    res.status(200).json({ 
      success: true, 
      visitId: result.lastID
    });
    
  } catch (error) {
    console.error('Error in trackPageVisit controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to track page visit', 
      error: error.message 
    });
  }
};

// Function for tracking landing page visits specifically
exports.trackLandingPageVisit = async (req, res) => {
  try {
    const { 
      pageUrl, 
      referrer, 
      utmSource, 
      utmMedium, 
      utmCampaign
    } = req.body;
    
    // Get IP and user agent
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress || 
                     req.connection.socket.remoteAddress;
    
    const visitData = {
      pageUrl, 
      referrer, 
      utmSource, 
      utmMedium, 
      utmCampaign, 
      userAgent, 
      ipAddress,
      isLandingPage: true // This is specifically a landing page visit
    };
    
    // Track the visit
    const result = await Analytics.trackVisit(visitData);
    
    // Return visit ID
    res.status(200).json({ 
      success: true, 
      visitId: result.lastID
    });
    
  } catch (error) {
    console.error('Error in trackLandingPageVisit controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to track landing page visit', 
      error: error.message 
    });
  }
};

exports.trackEngagement = async (req, res) => {
  try {
    const { 
      visitId, 
      timeOnPage, 
      scrollDepth, 
      clickCount, 
      formInteractions 
    } = req.body;
    
    if (!visitId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Visit ID is required' 
      });
    }
    
    const result = await Analytics.trackEngagement({
      visitId, 
      timeOnPage, 
      scrollDepth, 
      clickCount, 
      formInteractions
    });
    
    res.status(200).json({ 
      success: true, 
      engagementId: result.lastID 
    });
  } catch (error) {
    console.error('Error in trackEngagement controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to track engagement', 
      error: error.message 
    });
  }
};

exports.trackConversion = async (req, res) => {
  try {
    const { 
      visitId, 
      conversionType, 
      conversionValue, 
      conversionData,
      attributionModel
    } = req.body;
    
    if (!visitId || !conversionType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Visit ID and conversion type are required' 
      });
    }
    
    const result = await Analytics.trackConversion({
      visitId, 
      conversionType, 
      conversionValue, 
      conversionData
    });
    
    // Perform attribution if model specified
    let attribution = null;
    if (attributionModel) {
      attribution = await AttributionService.attributeConversion(
        result.lastID,
        attributionModel
      );
    }
    
    res.status(200).json({ 
      success: true, 
      conversionId: result.lastID,
      attribution: attribution
    });
  } catch (error) {
    console.error('Error in trackConversion controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to track conversion', 
      error: error.message 
    });
  }
};

exports.getAnalyticsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Both startDate and endDate are required'
      });
    }
    
    // Get current metrics
    const metrics = metricTrackingService.getMetrics();
    
    // Get average time on page
    let averageEngagementTime = metrics.averageTimePerUser || 0;
    
    // If no current data, try to get from database
    if (averageEngagementTime === 0) {
      const avgTimeQuery = `
        SELECT AVG(pe.time_on_page) as avg_time
        FROM page_engagement pe
        JOIN page_visits pv ON pe.visit_id = pv.id
        WHERE pv.visit_time BETWEEN ? AND ?
          AND pv.is_bot = 0
      `;
      
      const db = getDbConnection();
      
      const avgResult = await new Promise((resolve, reject) => {
        db.get(avgTimeQuery, [startDate, endDate], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (avgResult && avgResult.avg_time) {
        averageEngagementTime = avgResult.avg_time;
      }
      
      db.close();
    }
    
    // Get total visits
    const totalVisitsQuery = `
      SELECT COUNT(*) as count
      FROM page_visits
      WHERE is_landing_page = 1
        AND is_bot = 0
        AND visit_time BETWEEN ? AND ?
    `;
    
    const db = getDbConnection();
    
    const totalVisitsResult = await new Promise((resolve, reject) => {
      db.get(totalVisitsQuery, [startDate, endDate], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    const totalVisits = totalVisitsResult ? totalVisitsResult.count : 0;
    
    // Get unique visitors (approximate by unique session IDs)
    const uniqueVisitorsQuery = `
      SELECT COUNT(DISTINCT session_id) as count
      FROM page_visits
      WHERE is_landing_page = 1
        AND is_bot = 0
        AND visit_time BETWEEN ? AND ?
    `;
    
    const uniqueVisitorsResult = await new Promise((resolve, reject) => {
      db.get(uniqueVisitorsQuery, [startDate, endDate], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    const uniqueVisitors = uniqueVisitorsResult ? uniqueVisitorsResult.count : 0;
    
    // Get conversions
    const conversionsQuery = `
      SELECT COUNT(*) as count
      FROM conversions
      WHERE conversion_time BETWEEN ? AND ?
    `;
    
    const conversionsResult = await new Promise((resolve, reject) => {
      db.get(conversionsQuery, [startDate, endDate], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    const conversions = conversionsResult ? conversionsResult.count : 0;
    
    // Calculate conversion rate
    const conversionRate = totalVisits > 0 ? (conversions / totalVisits * 100).toFixed(2) : 0;
    
    db.close();
    
    res.status(200).json({
      success: true,
      totalVisits,
      uniqueVisitors,
      conversions,
      conversionRate,
      averageEngagementTime
    });
  } catch (error) {
    console.error('Error generating analytics report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate analytics report',
      error: error.message
    });
  }
};

// Function to get landing page metrics
exports.getLandingPageMetrics = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      utmSource,
      landingPages
    } = req.query;
    
    const filters = {
      startDate,
      endDate,
      utmSource,
      landingPages: landingPages ? landingPages.split(',') : undefined
    };
    
    const metrics = await LandingPageMetricsService.getLandingPageMetrics(filters);
    
    res.status(200).json({ 
      success: true, 
      data: metrics 
    });
  } catch (error) {
    console.error('Error in getLandingPageMetrics controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate landing page metrics', 
      error: error.message 
    });
  }
};

// Function to get top traffic sources for landing pages
exports.getTopTrafficSources = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate,
      landingPages
    } = req.query;
    
    const filters = {
      startDate,
      endDate,
      landingPages: landingPages ? landingPages.split(',') : undefined
    };
    
    const sources = await LandingPageMetricsService.getTopTrafficSources(filters);
    
    res.status(200).json({ 
      success: true, 
      data: sources 
    });
  } catch (error) {
    console.error('Error in getTopTrafficSources controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get top traffic sources', 
      error: error.message 
    });
  }
};

// New endpoint to get device breakdown
exports.getDeviceBreakdown = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      isLandingPage 
    } = req.query;
    
    const filters = {
      startDate,
      endDate,
      isLandingPage: isLandingPage === 'true' ? true : isLandingPage === 'false' ? false : undefined
    };
    
    const breakdown = await Analytics.getDeviceBreakdown(filters);
    
    res.status(200).json({ 
      success: true, 
      data: breakdown 
    });
  } catch (error) {
    console.error('Error in getDeviceBreakdown controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get device breakdown', 
      error: error.message 
    });
  }
};

// New endpoint to get geographic distribution
exports.getGeographicDistribution = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      isLandingPage 
    } = req.query;
    
    const filters = {
      startDate,
      endDate,
      isLandingPage: isLandingPage === 'true' ? true : isLandingPage === 'false' ? false : undefined
    };
    
    const distribution = await Analytics.getGeographicDistribution(filters);
    
    res.status(200).json({ 
      success: true, 
      data: distribution 
    });
  } catch (error) {
    console.error('Error in getGeographicDistribution controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get geographic distribution', 
      error: error.message 
    });
  }
};

// New endpoint to get new vs returning visitor metrics
exports.getNewVsReturningMetrics = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      isLandingPage 
    } = req.query;
    
    const filters = {
      startDate,
      endDate,
      isLandingPage: isLandingPage === 'true' ? true : isLandingPage === 'false' ? false : undefined
    };
    
    const metrics = await Analytics.getNewVsReturningMetrics(filters);
    
    res.status(200).json({ 
      success: true, 
      data: metrics 
    });
  } catch (error) {
    console.error('Error in getNewVsReturningMetrics controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get new vs returning metrics', 
      error: error.message 
    });
  }
};

// New endpoint for attribution analysis
exports.getAttributionAnalysis = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      attributionModel = 'last'
    } = req.query;
    
    const filters = {
      startDate,
      endDate,
      attributionModel
    };
    
    const analysis = await AttributionService.getAttributionAnalysis(filters);
    
    res.status(200).json({ 
      success: true, 
      data: analysis 
    });
  } catch (error) {
    console.error('Error in getAttributionAnalysis controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get attribution analysis', 
      error: error.message 
    });
  }
};

// New endpoint to compare attribution models
exports.compareAttributionModels = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate
    } = req.query;
    
    const filters = {
      startDate,
      endDate
    };
    
    const comparison = await AttributionService.compareAttributionModels(filters);
    
    res.status(200).json({ 
      success: true, 
      data: comparison 
    });
  } catch (error) {
    console.error('Error in compareAttributionModels controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to compare attribution models', 
      error: error.message 
    });
  }
};

// New endpoint to get automated insights
exports.getAnalyticsInsights = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      landingPages
    } = req.query;
    
    const filters = {
      startDate,
      endDate,
      landingPages: landingPages ? landingPages.split(',') : undefined
    };
    
    const insights = await AnalyticsInsightService.generateLandingPageInsights(filters);
    
    res.status(200).json({ 
      success: true, 
      data: insights 
    });
  } catch (error) {
    console.error('Error in getAnalyticsInsights controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get analytics insights', 
      error: error.message 
    });
  }
};

// New endpoint to get optimization suggestions
exports.getOptimizationSuggestions = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      landingPages
    } = req.query;
    
    const filters = {
      startDate,
      endDate,
      landingPages: landingPages ? landingPages.split(',') : undefined
    };
    
    const suggestions = await AnalyticsInsightService.getOptimizationSuggestions(filters);
    
    res.status(200).json({ 
      success: true, 
      data: suggestions 
    });
  } catch (error) {
    console.error('Error in getOptimizationSuggestions controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get optimization suggestions', 
      error: error.message 
    });
  }
};

// Function to get metrics by report type
exports.getMetricsByReportType = async (req, res) => {
  try {
    const { reportType, limit } = req.query;
    
    if (!reportType || !['daily', 'weekly', 'monthly', 'realtime'].includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type. Must be one of: daily, weekly, monthly, realtime'
      });
    }
    
    const metrics = await metricTrackingService.getMetricsSnapshotsByType(
      reportType, 
      limit ? parseInt(limit, 10) : 30
    );
    
    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error getting metrics by report type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get metrics by report type',
      error: error.message
    });
  }
};

// Function to get the latest metric snapshot by report type
exports.getLatestMetricByReportType = async (req, res) => {
  try {
    // Default to 'daily' for the public test endpoint
    const reportType = req.params.reportType || 'daily';
    
    // Validate report type
    if (!['daily', 'weekly', 'monthly', 'realtime'].includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type. Must be daily, weekly, monthly, or realtime'
      });
    }
    
    // Get the latest metrics snapshot for the specified report type
    const latestSnapshot = await metricTrackingService.getLatestMetricsSnapshot(reportType);
    
    if (!latestSnapshot) {
      // If no snapshot exists, use the current metrics (better for real-time view)
      if (reportType === 'realtime') {
        const currentMetrics = metricTrackingService.getMetrics();
        
        // Format for consistent response
        return res.status(200).json({
          success: true,
          data: {
            landing_page_visits: currentMetrics.landingPageVisits || 0,
            conversions: currentMetrics.conversions || 0,
            referral_counts: currentMetrics.referralCounts || {},
            devices: currentMetrics.devices || {},
            geography: currentMetrics.geography || {},
            average_time_per_user: currentMetrics.averageTimePerUser || 0,
            report_type: 'realtime',
            snapshot_time: currentMetrics.lastUpdated || new Date().toISOString()
          }
        });
      }
      
      return res.status(404).json({
        success: false,
        message: `No ${reportType} metrics snapshot found`
      });
    }
    
    res.status(200).json({
      success: true,
      data: latestSnapshot
    });
  } catch (error) {
    console.error(`Error getting latest metrics:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to get latest metrics`,
      error: error.message
    });
  }
};

// Function to get latest traffic sources
exports.getLatestTrafficSources = async (req, res) => {
  try {
    const { reportType } = req.query;
    
    let trafficSources = {};
    
    if (reportType && ['daily', 'weekly', 'monthly'].includes(reportType)) {
      // Get from stored report
      const report = await metricTrackingService.getLatestMetricsSnapshot(reportType);
      if (report) {
        trafficSources = report.referral_counts;
      }
    } else {
      // Get realtime data
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      trafficSources = await metricTrackingService.getReferralCounts(todayStart);
    }
    
    // Transform into array format for easier consumption by frontend
    const sourcesArray = Object.entries(trafficSources).map(([source, count]) => ({
      source,
      count
    })).sort((a, b) => b.count - a.count);
    
    res.status(200).json({
      success: true,
      data: {
        sources: sourcesArray
      }
    });
  } catch (error) {
    console.error('Error getting latest traffic sources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get latest traffic sources',
      error: error.message
    });
  }
};

// Function to get conversion rate trend
exports.getConversionRateTrend = async (req, res) => {
  try {
    const { period } = req.query;
    let startDate;
    
    // Determine the time period to fetch
    const now = new Date();
    if (period === 'weekly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    } else if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    } else {
      // Default to 30 days
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    }
    
    const conversionRateData = await metricTrackingService.getConversionRateTrend(startDate.toISOString());
    
    res.status(200).json({
      success: true,
      data: conversionRateData
    });
  } catch (error) {
    console.error('Error getting conversion rate trend:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversion rate trend',
      error: error.message
    });
  }
}; 