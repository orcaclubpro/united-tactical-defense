/**
 * Google Analytics 4 Data API Integration Service
 * 
 * This service provides functions to fetch real-time and historical data from
 * Google Analytics 4 using the Google Analytics Data API v1.
 * 
 * Documentation: https://developers.google.com/analytics/devguides/reporting/data/v1
 */

import axios from 'axios';

// Configuration
const GA4_PROPERTY_ID = process.env.REACT_APP_GA4_MEASUREMENT_ID?.replace('G-', '') || '';
const API_BASE_URL = 'https://analyticsdata.googleapis.com/v1';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Interface for date range parameters
interface DateRange {
  startDate: string; // Format: 'YYYY-MM-DD'
  endDate: string;   // Format: 'YYYY-MM-DD'
}

// Interface for GA4 request parameters
interface GA4RequestParams {
  dateRanges: {
    startDate: string;
    endDate: string;
  }[];
  dimensions?: {
    name: string;
  }[];
  metrics: {
    name: string;
  }[];
  limit?: number;
  offset?: number;
  orderBys?: {
    dimension?: {
      dimensionName: string;
      orderType: 'ALPHANUMERIC' | 'NUMERIC' | 'ALPHANUMERIC_CASE_INSENSITIVE';
    };
    metric?: {
      metricName: string;
    };
    desc?: boolean;
  }[];
  metricAggregations?: ('TOTAL' | 'MINIMUM' | 'MAXIMUM' | 'COUNT')[];
  dimensionFilter?: {
    filter: {
      fieldName: string;
      stringFilter?: {
        matchType: 'EXACT' | 'BEGINS_WITH' | 'ENDS_WITH' | 'CONTAINS' | 'FULL_REGEXP' | 'PARTIAL_REGEXP';
        value: string;
        caseSensitive?: boolean;
      };
      inListFilter?: {
        values: string[];
        caseSensitive?: boolean;
      };
      numericFilter?: {
        operation: 'EQUAL' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL' | 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL';
        value: {
          int64Value?: string;
          doubleValue?: number;
        };
      };
    };
    andGroup?: any;
    orGroup?: any;
    notExpression?: any;
  };
}

// Interface for parsed GA4 response data
interface GA4ResponseData {
  rows: {
    dimensionValues?: { value: string }[];
    metricValues: { value: string }[];
  }[];
  totals: {
    dimensionValues?: { value: string }[];
    metricValues: { value: string }[];
  }[];
  rowCount: number;
  metadata: {
    dimensions: string[];
    metrics: string[];
  };
}

/**
 * Convert a Date object to the GA4 API date format (YYYY-MM-DD)
 */
const formatDateForGA4 = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Convert a relative date string like '7daysAgo', '30daysAgo', 'yesterday', 'today' to GA4 format
 */
const formatRelativeDateForGA4 = (relativeDate: string): string => {
  const today = new Date();
  
  if (relativeDate === 'today') {
    return formatDateForGA4(today);
  }
  
  if (relativeDate === 'yesterday') {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDateForGA4(yesterday);
  }
  
  // Handle '7daysAgo', '30daysAgo', etc.
  const daysAgoMatch = relativeDate.match(/^(\d+)daysAgo$/);
  if (daysAgoMatch) {
    const daysAgo = parseInt(daysAgoMatch[1], 10);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    return formatDateForGA4(date);
  }
  
  // If not a recognized format, return as is (assuming it's already in YYYY-MM-DD format)
  return relativeDate;
};

/**
 * Get the access token for the Google Analytics Data API
 * This should use your preferred authentication method (OAuth, service account, etc.)
 * For client-side implementation, you'll typically proxy this through your backend
 */
const getAccessToken = async (): Promise<string> => {
  try {
    // In a real implementation, you would:
    // 1. Either get the token from your backend (recommended for security)
    // 2. Or use a library like gapi to handle authentication in the browser
    
    // For now, we'll simulate a backend call that returns a token
    const response = await axios.get('/api/ga4/token');
    return response.data.accessToken;
  } catch (error) {
    console.error('Error getting GA4 access token:', error);
    throw new Error('Failed to authenticate with Google Analytics');
  }
};

/**
 * Make a request to the Google Analytics Data API with retry logic
 */
export const makeGA4Request = async (
  params: GA4RequestParams,
  attempt = 1
): Promise<GA4ResponseData> => {
  try {
    // For client-side implementation, you should proxy this through your backend
    // to keep your access token secure
    
    // But for demonstration, here's how you would make a direct API call:
    const accessToken = await getAccessToken();
    const url = `${API_BASE_URL}/properties/${GA4_PROPERTY_ID}:runReport`;
    
    const response = await axios.post(url, params, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error: any) {
    if (attempt < MAX_RETRY_ATTEMPTS) {
      // Add exponential backoff for retries
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
      console.warn(`GA4 API request failed (attempt ${attempt}). Retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeGA4Request(params, attempt + 1);
    }
    
    console.error('GA4 API request failed after max retries:', error);
    throw error;
  }
};

/**
 * Get total page views for a date range
 */
export const getPageViews = async (dateRange: DateRange): Promise<number> => {
  try {
    const params: GA4RequestParams = {
      dateRanges: [{
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }],
      metrics: [{ name: 'screenPageViews' }]
    };
    
    const response = await makeGA4Request(params);
    
    // Extract the page view count from the response
    const pageViews = parseInt(response.totals[0].metricValues[0].value, 10);
    return pageViews;
  } catch (error) {
    console.error('Error fetching page views:', error);
    return 0;
  }
};

/**
 * Get daily page views for a date range
 */
export const getDailyPageViews = async (dateRange: DateRange): Promise<{ date: string; visits: number }[]> => {
  try {
    const params: GA4RequestParams = {
      dateRanges: [{
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{
        dimension: {
          dimensionName: 'date',
          orderType: 'NUMERIC'
        }
      }]
    };
    
    const response = await makeGA4Request(params);
    
    // Transform the response into the expected format
    return response.rows.map(row => ({
      date: row.dimensionValues?.[0].value || '',
      visits: parseInt(row.metricValues[0].value, 10)
    }));
  } catch (error) {
    console.error('Error fetching daily page views:', error);
    return [];
  }
};

/**
 * Get unique visitors (users) for a date range
 */
export const getUniqueVisitors = async (dateRange: DateRange): Promise<number> => {
  try {
    const params: GA4RequestParams = {
      dateRanges: [{
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }],
      metrics: [{ name: 'totalUsers' }]
    };
    
    const response = await makeGA4Request(params);
    
    // Extract the unique visitors count from the response
    const uniqueVisitors = parseInt(response.totals[0].metricValues[0].value, 10);
    return uniqueVisitors;
  } catch (error) {
    console.error('Error fetching unique visitors:', error);
    return 0;
  }
};

/**
 * Get average engagement time (in seconds) for a date range
 */
export const getAverageEngagementTime = async (dateRange: DateRange): Promise<number> => {
  try {
    const params: GA4RequestParams = {
      dateRanges: [{
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }],
      metrics: [{ name: 'userEngagementDuration' }, { name: 'sessions' }]
    };
    
    const response = await makeGA4Request(params);
    
    // Calculate average engagement time per session (in seconds)
    const totalEngagementDuration = parseFloat(response.totals[0].metricValues[0].value);
    const totalSessions = parseInt(response.totals[0].metricValues[1].value, 10);
    
    if (totalSessions === 0) return 0;
    
    // Convert seconds to minutes
    return Math.round((totalEngagementDuration / totalSessions) / 60);
  } catch (error) {
    console.error('Error fetching average engagement time:', error);
    return 0;
  }
};

/**
 * Get traffic sources breakdown for a date range
 */
export const getTrafficSources = async (dateRange: DateRange): Promise<{ source: string; visits: number }[]> => {
  try {
    const params: GA4RequestParams = {
      dateRanges: [{
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }],
      dimensions: [{ name: 'sessionSource' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{
        metric: { metricName: 'sessions' },
        desc: true
      }],
      limit: 10
    };
    
    const response = await makeGA4Request(params);
    
    // Transform the response into the expected format
    return response.rows.map(row => ({
      source: row.dimensionValues?.[0].value || 'direct',
      visits: parseInt(row.metricValues[0].value, 10)
    }));
  } catch (error) {
    console.error('Error fetching traffic sources:', error);
    return [];
  }
};

/**
 * Get device breakdown for a date range
 */
export const getDeviceBreakdown = async (dateRange: DateRange): Promise<{ device: string; count: number }[]> => {
  try {
    const params: GA4RequestParams = {
      dateRanges: [{
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{
        metric: { metricName: 'sessions' },
        desc: true
      }]
    };
    
    const response = await makeGA4Request(params);
    
    // Transform the response into the expected format
    return response.rows.map(row => ({
      device: row.dimensionValues?.[0].value || 'unknown',
      count: parseInt(row.metricValues[0].value, 10)
    }));
  } catch (error) {
    console.error('Error fetching device breakdown:', error);
    return [];
  }
};

/**
 * Get geographic distribution of users for a date range
 */
export const getGeographicDistribution = async (dateRange: DateRange): Promise<{ region: string; count: number }[]> => {
  try {
    const params: GA4RequestParams = {
      dateRanges: [{
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{
        metric: { metricName: 'sessions' },
        desc: true
      }],
      limit: 10
    };
    
    const response = await makeGA4Request(params);
    
    // Transform the response into the expected format
    return response.rows.map(row => ({
      region: row.dimensionValues?.[0].value || 'unknown',
      count: parseInt(row.metricValues[0].value, 10)
    }));
  } catch (error) {
    console.error('Error fetching geographic distribution:', error);
    return [];
  }
};

/**
 * Get conversion events (form submissions) for a date range
 */
export const getConversions = async (dateRange: DateRange): Promise<number> => {
  try {
    const params: GA4RequestParams = {
      dateRanges: [{
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }],
      metrics: [{ name: 'conversions' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: {
            matchType: 'EXACT',
            value: 'generate_lead'
          }
        }
      }
    };
    
    const response = await makeGA4Request(params);
    
    // Extract the conversions count from the response
    const conversions = parseInt(response.totals[0].metricValues[0].value, 10);
    return conversions;
  } catch (error) {
    console.error('Error fetching conversions:', error);
    return 0;
  }
};

/**
 * Get conversion rate for a date range
 */
export const getConversionRate = async (dateRange: DateRange): Promise<number> => {
  try {
    const totalPageViews = await getPageViews(dateRange);
    const totalConversions = await getConversions(dateRange);
    
    if (totalPageViews === 0) return 0;
    
    // Calculate conversion rate as a percentage
    return (totalConversions / totalPageViews) * 100;
  } catch (error) {
    console.error('Error calculating conversion rate:', error);
    return 0;
  }
};

/**
 * Get daily conversions data for a date range
 */
export const getDailyConversions = async (dateRange: DateRange): Promise<{ date: string; visits: number; conversions: number }[]> => {
  try {
    // First, get daily page views
    const dailyPageViews = await getDailyPageViews(dateRange);
    
    // Then, get daily conversions
    const params: GA4RequestParams = {
      dateRanges: [{
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'conversions' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: {
            matchType: 'EXACT',
            value: 'generate_lead'
          }
        }
      },
      orderBys: [{
        dimension: {
          dimensionName: 'date',
          orderType: 'NUMERIC'
        }
      }]
    };
    
    const response = await makeGA4Request(params);
    
    // Create a map of dates to conversions
    const dateToConversions = new Map<string, number>();
    response.rows.forEach(row => {
      const date = row.dimensionValues?.[0].value || '';
      const conversions = parseInt(row.metricValues[0].value, 10);
      dateToConversions.set(date, conversions);
    });
    
    // Combine page views and conversions data
    return dailyPageViews.map(item => ({
      date: item.date,
      visits: item.visits,
      conversions: dateToConversions.get(item.date) || 0
    }));
  } catch (error) {
    console.error('Error fetching daily conversions:', error);
    return [];
  }
};

/**
 * Get new vs. returning visitors data for a date range
 */
export const getNewVsReturningVisitors = async (dateRange: DateRange): Promise<{ date: string; newVisitors: number; returningVisitors: number }[]> => {
  try {
    const params: GA4RequestParams = {
      dateRanges: [{
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }],
      dimensions: [{ name: 'date' }, { name: 'newVsReturning' }],
      metrics: [{ name: 'totalUsers' }],
      orderBys: [{
        dimension: {
          dimensionName: 'date',
          orderType: 'NUMERIC'
        }
      }]
    };
    
    const response = await makeGA4Request(params);
    
    // Create a map to organize data by date
    const dateMap = new Map<string, { newVisitors: number; returningVisitors: number }>();
    
    // Initialize the map with all dates in the range having zero values
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = formatDateForGA4(d);
      dateMap.set(dateString, { newVisitors: 0, returningVisitors: 0 });
    }
    
    // Fill in data from the response
    response.rows.forEach(row => {
      const date = row.dimensionValues?.[0].value || '';
      const userType = row.dimensionValues?.[1].value || '';
      const users = parseInt(row.metricValues[0].value, 10);
      
      const currentEntry = dateMap.get(date) || { newVisitors: 0, returningVisitors: 0 };
      
      if (userType === 'new') {
        currentEntry.newVisitors = users;
      } else if (userType === 'returning') {
        currentEntry.returningVisitors = users;
      }
      
      dateMap.set(date, currentEntry);
    });
    
    // Convert the map to an array of objects
    return Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      newVisitors: data.newVisitors,
      returningVisitors: data.returningVisitors
    })).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching new vs. returning visitors:', error);
    return [];
  }
};

/**
 * Get a complete analytics report with all metrics for a date range
 */
export const getAnalyticsReport = async (startDate: string, endDate: string) => {
  try {
    // Create a date range object
    const dateRange: DateRange = { startDate, endDate };
    
    // Run all API requests in parallel for better performance
    const [
      totalPageViews,
      uniqueVisitors,
      averageEngagementTime,
      trafficSources,
      deviceBreakdown,
      geographicDistribution,
      dailyPageViews,
      dailyConversions,
      newVsReturningVisitors,
      conversionRate
    ] = await Promise.all([
      getPageViews(dateRange),
      getUniqueVisitors(dateRange),
      getAverageEngagementTime(dateRange),
      getTrafficSources(dateRange),
      getDeviceBreakdown(dateRange),
      getGeographicDistribution(dateRange),
      getDailyPageViews(dateRange),
      getDailyConversions(dateRange),
      getNewVsReturningVisitors(dateRange),
      getConversionRate(dateRange)
    ]);
    
    // Compile all data into a comprehensive report
    return {
      // Summary metrics
      totalVisits: totalPageViews,
      uniqueVisitors,
      conversionRate,
      averageEngagementTime,
      
      // Detailed data
      trafficSources,
      deviceBreakdown,
      geographicDistribution,
      dailyPageViews,
      dailyConversions,
      newVsReturningVisitors
    };
  } catch (error) {
    console.error('Error generating analytics report:', error);
    throw error;
  }
};

/**
 * Get detailed landing page metrics including bounce rate and average session duration
 */
export const getLandingPageMetrics = async (dateRange: DateRange): Promise<{
  pageViews: number;
  uniquePageViews: number;
  bounceRate: number;
  averageSessionDuration: number;
  averageTimeOnPage: number;
  exitRate: number;
}> => {
  try {
    const params: GA4RequestParams = {
      dateRanges: [{
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'totalUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'averageTimeOnPage' },
        { name: 'exitRate' }
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'EXACT',
            value: '/'
          }
        }
      }
    };
    
    const response = await makeGA4Request(params);
    
    return {
      pageViews: parseInt(response.totals[0].metricValues[0].value, 10),
      uniquePageViews: parseInt(response.totals[0].metricValues[1].value, 10),
      bounceRate: parseFloat(response.totals[0].metricValues[2].value),
      averageSessionDuration: parseFloat(response.totals[0].metricValues[3].value),
      averageTimeOnPage: parseFloat(response.totals[0].metricValues[4].value),
      exitRate: parseFloat(response.totals[0].metricValues[5].value)
    };
  } catch (error) {
    console.error('Error fetching landing page metrics:', error);
    throw error;
  }
};

/**
 * Get user engagement metrics
 */
export const getUserEngagementMetrics = async (dateRange: DateRange): Promise<{
  engagedSessions: number;
  engagementRate: number;
  averageEngagementTime: number;
  eventsPerSession: number;
}> => {
  try {
    const params: GA4RequestParams = {
      dateRanges: [{
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }],
      metrics: [
        { name: 'engagedSessions' },
        { name: 'engagementRate' },
        { name: 'averageEngagementTime' },
        { name: 'eventsPerSession' }
      ]
    };
    
    const response = await makeGA4Request(params);
    
    return {
      engagedSessions: parseInt(response.totals[0].metricValues[0].value, 10),
      engagementRate: parseFloat(response.totals[0].metricValues[1].value),
      averageEngagementTime: parseFloat(response.totals[0].metricValues[2].value),
      eventsPerSession: parseFloat(response.totals[0].metricValues[3].value)
    };
  } catch (error) {
    console.error('Error fetching user engagement metrics:', error);
    throw error;
  }
};

/**
 * Get conversion funnel metrics
 */
export const getConversionFunnelMetrics = async (dateRange: DateRange): Promise<{
  totalConversions: number;
  conversionRate: number;
  conversionValue: number;
  conversionBySource: Array<{
    source: string;
    conversions: number;
    value: number;
  }>;
}> => {
  try {
    const params: GA4RequestParams = {
      dateRanges: [{
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }],
      metrics: [
        { name: 'conversions' },
        { name: 'conversionRate' },
        { name: 'totalRevenue' }
      ],
      dimensions: [
        { name: 'sessionSource' }
      ]
    };
    
    const response = await makeGA4Request(params);
    
    const conversionBySource = response.rows.map(row => {
      if (!row.dimensionValues?.[0]?.value || !row.metricValues?.[0]?.value || !row.metricValues?.[2]?.value) {
        return {
          source: 'Unknown',
          conversions: 0,
          value: 0
        };
      }
      return {
        source: row.dimensionValues[0].value,
        conversions: parseInt(row.metricValues[0].value, 10),
        value: parseFloat(row.metricValues[2].value)
      };
    });
    
    return {
      totalConversions: parseInt(response.totals[0].metricValues[0].value, 10),
      conversionRate: parseFloat(response.totals[0].metricValues[1].value),
      conversionValue: parseFloat(response.totals[0].metricValues[2].value),
      conversionBySource
    };
  } catch (error) {
    console.error('Error fetching conversion funnel metrics:', error);
    throw error;
  }
};
