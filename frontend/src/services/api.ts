import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  source: string;
  status: string;
  notes: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  lead_id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes: string;
}

export interface PageVisit {
  id: string;
  page: string;
  referrer: string;
  timestamp: string;
  session_id?: string;
  device_type?: string;
  device_os?: string;
  browser?: string;
  country?: string;
  region?: string;
  city?: string;
  is_new_visitor?: boolean;
  // Legacy fields for backward compatibility
  pageUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  userAgent?: string;
  ipAddress?: string;
  is_landing_page?: number;
  visit_time?: string;
}

export interface Conversion {
  id: string;
  page_visit_id: string;
  type: string;
  value: number;
  timestamp: string;
}

export interface MetricsSnapshot {
  id: string;
  date: string;
  visits: number;
  unique_visitors: number;
  average_time_on_page: number;
  bounce_rate: number;
  conversion_rate: number;
}

export interface DeviceBreakdown {
  devices: {
    device: string;
    count: number;
  }[];
}

export interface GeographicDistribution {
  regions: {
    region: string;
    count: number;
  }[];
}

export interface VisitorMetrics {
  dailyMetrics: {
    date: string;
    newVisitors: number;
    returningVisitors: number;
  }[];
}

export interface AttributionModel {
  channels: {
    channel: string;
    contribution: number;
  }[];
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  date: string;
}

export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  expectedImpact: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

// Lead APIs
export const getLeads = async () => {
  return await api.get('/leads');
};

export const getLeadById = async (id: string) => {
  return await api.get(`/leads/${id}`);
};

export const createLead = async (lead: Omit<Lead, 'id' | 'created_at'>) => {
  return await api.post('/leads', lead);
};

export const updateLead = async (id: string, lead: Partial<Lead>) => {
  return await api.put(`/leads/${id}`, lead);
};

export const deleteLead = async (id: string) => {
  return await api.delete(`/leads/${id}`);
};

// Appointment APIs
export const getAppointments = async () => {
  return await api.get('/appointments');
};

export const getAppointmentById = async (id: string) => {
  return await api.get(`/appointments/${id}`);
};

export const createAppointment = async (appointment: Omit<Appointment, 'id'>) => {
  return await api.post('/appointments', appointment);
};

export const updateAppointment = async (id: string, appointment: Partial<Appointment>) => {
  return await api.put(`/appointments/${id}`, appointment);
};

export const deleteAppointment = async (id: string) => {
  return await api.delete(`/appointments/${id}`);
};

// Analytics APIs - Original
export const trackPageVisit = async (pageVisit: Omit<PageVisit, 'id'>) => {
  return await api.post('/analytics/pageVisits', pageVisit);
};

export const trackConversion = async (conversion: Omit<Conversion, 'id'>) => {
  return await api.post('/analytics/conversions', conversion);
};

export const getMetricsSnapshots = async (startDate: string, endDate: string) => {
  return await api.get(`/analytics/metrics?startDate=${startDate}&endDate=${endDate}`);
};

// Enhanced Analytics APIs
export const getAnalyticsReport = async (startDate: string, endDate: string) => {
  const response = await api.get(`/analytics/report?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getLandingPageMetrics = async (startDate: string, endDate: string) => {
  const response = await api.get(`/analytics/landingPageMetrics?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getTopTrafficSources = async (startDate: string, endDate: string) => {
  const response = await api.get(`/analytics/trafficSources?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getDeviceBreakdown = async (startDate: string, endDate: string) => {
  const response = await api.get(`/analytics/deviceBreakdown?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getGeographicDistribution = async (startDate: string, endDate: string) => {
  const response = await api.get(`/analytics/geographicDistribution?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getNewVsReturningMetrics = async (startDate: string, endDate: string) => {
  const response = await api.get(`/analytics/visitorMetrics?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getAttributionAnalysis = async (startDate: string, endDate: string) => {
  const response = await api.get(`/analytics/attributionAnalysis?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const compareAttributionModels = async (startDate: string, endDate: string, models: string[]) => {
  const response = await api.post(`/analytics/compareAttributionModels`, {
    startDate,
    endDate,
    models
  });
  return response.data;
};

export const getAnalyticsInsights = async (startDate: string, endDate: string) => {
  const response = await api.get(`/analytics/insights?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getOptimizationSuggestions = async (startDate: string, endDate: string) => {
  const response = await api.get(`/analytics/optimizationSuggestions?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

// Form Handling
export const processForm = async (formData: any) => {
  return await api.post('/forms/submit', formData);
};

// Legacy form handlers
export const submitAssessmentForm = async (formData: any) => {
  return await api.post('/form/assessment', formData);
};

export const submitFreeClassForm = async (formData: any) => {
  return await api.post('/form/free-class', formData);
};

export const submitContactForm = async (formData: any) => {
  return await api.post('/form/contact', formData);
};

/**
 * Get metrics reports by report type
 * @param reportType - 'daily', 'weekly', 'monthly', or 'realtime'
 * @param limit - Maximum number of records to return
 * @returns Report data
 */
export const getMetricsByReportType = async (reportType: string, limit: number = 30) => {
  try {
    const response = await api.get(`/analytics/metrics?reportType=${reportType}&limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching metrics by report type:', error);
    return [];
  }
};

/**
 * Get latest metric by report type
 * @param reportType - 'daily', 'weekly', 'monthly', or 'realtime'
 * @returns Latest report data
 */
export const getLatestMetricByReportType = async (reportType: string) => {
  try {
    const response = await api.get(`/analytics/metrics/${reportType}/latest`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching latest ${reportType} metric:`, error);
    return null;
  }
};

/**
 * Get latest traffic sources
 * @param reportType - Optional: 'daily', 'weekly', or 'monthly'
 * @returns Traffic sources data
 */
export const getLatestTrafficSources = async (reportType?: string) => {
  try {
    const url = reportType 
      ? `/analytics/traffic-sources/latest?reportType=${reportType}`
      : '/analytics/traffic-sources/latest';
    
    const response = await api.get(url);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching latest traffic sources:', error);
    return { sources: [] };
  }
};

/**
 * Get conversion rate trend
 * @param period - 'daily', 'weekly', or 'monthly'
 * @returns Conversion rate trend data
 */
export const getConversionRateTrend = async (period: string = 'daily') => {
  try {
    const response = await api.get(`/analytics/conversion-rate-trend?period=${period}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching conversion rate trend:', error);
    return [];
  }
};

export default api; 