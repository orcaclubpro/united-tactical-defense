const Analytics = require('../models/analytics');
const LandingPageMetricsService = require('../services/landingPageMetricsService');

exports.trackPageVisit = async (req, res) => {
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
      ipAddress
    };
    
    const result = await Analytics.trackVisit(visitData);
    
    // Return the visit ID for subsequent tracking calls
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

// New function for tracking landing page visits specifically
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
      ipAddress
    };
    
    const result = await LandingPageMetricsService.trackLandingPageVisit(visitData);
    
    // Return the visit ID for subsequent tracking calls
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
      conversionData 
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
    
    res.status(200).json({ 
      success: true, 
      conversionId: result.lastID 
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
    const { 
      startDate, 
      endDate, 
      utmSource, 
      pageUrl 
    } = req.query;
    
    const filters = {
      startDate,
      endDate,
      utmSource,
      pageUrl
    };
    
    const report = await Analytics.getAnalyticsReport(filters);
    
    res.status(200).json({ 
      success: true, 
      data: report 
    });
  } catch (error) {
    console.error('Error in getAnalyticsReport controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate analytics report', 
      error: error.message 
    });
  }
};

// New function to get landing page metrics
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

// New function to get top traffic sources for landing pages
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