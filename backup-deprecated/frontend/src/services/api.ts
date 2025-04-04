import axios from 'axios';
import goHighLevelAppointmentClient from './api/GoHighLevelAppointmentClient';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/',  // Don't include /api here to avoid duplicating it in requests
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor to add /api prefix to all requests
api.interceptors.request.use(
  (config) => {
    // Only add /api prefix if the URL doesn't already have it and is not an absolute URL
    if (!config.url?.startsWith('/api') && !config.url?.startsWith('http')) {
      config.url = `/api${config.url}`;
    }
    
    // For debugging
    console.log(`[API] Making request to: ${config.url}`);
    
    return config;
  },
  (error) => Promise.reject(error)
);

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

export interface TimeSlot {
  id: string;
  time: string;
  date: string;
  available: boolean;
  capacity?: number;
  remaining?: number;
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

// Offline support types
export interface QueuedFormSubmission {
  id: string;
  endpoint: string;
  formData: any;
  timestamp: number;
  retryCount: number;
  options?: FormSubmissionOptions;
}

// Constants for offline queue
const QUEUE_STORAGE_KEY = 'offline_form_submission_queue';
const MAX_RETRY_COUNT = 5;
const INITIAL_RETRY_DELAY = 5000; // 5 seconds
const EXPONENTIAL_BACKOFF_FACTOR = 1.5;

// Check if online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Listen for online/offline events
export const setupConnectionListeners = (
  onlineCallback?: () => void,
  offlineCallback?: () => void
) => {
  window.addEventListener('online', () => {
    console.log('Application is online. Processing queued submissions...');
    if (onlineCallback) {
      onlineCallback();
    }
    processQueuedSubmissions();
  });

  window.addEventListener('offline', () => {
    console.log('Application is offline. Submissions will be queued.');
    if (offlineCallback) {
      offlineCallback();
    }
  });
};

// Get the submission queue from local storage
export const getSubmissionQueue = (): QueuedFormSubmission[] => {
  const queueString = localStorage.getItem(QUEUE_STORAGE_KEY);
  if (!queueString) {
    return [];
  }
  try {
    return JSON.parse(queueString);
  } catch (error) {
    console.error('Error parsing submission queue:', error);
    return [];
  }
};

// Save the submission queue to local storage
export const saveSubmissionQueue = (queue: QueuedFormSubmission[]): void => {
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
};

// Add a submission to the queue
export const queueFormSubmission = (
  endpoint: string,
  formData: any,
  options?: FormSubmissionOptions
): string => {
  const queue = getSubmissionQueue();
  const id = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const submission: QueuedFormSubmission = {
    id,
    endpoint,
    formData,
    timestamp: Date.now(),
    retryCount: 0,
    options
  };
  
  queue.push(submission);
  saveSubmissionQueue(queue);
  
  // Schedule processing if online
  if (isOnline()) {
    setTimeout(() => processQueuedSubmissions(), 0);
  }
  
  return id;
};

// Process all queued submissions
export const processQueuedSubmissions = async (): Promise<void> => {
  if (!isOnline()) {
    console.log('Cannot process queue while offline');
    return;
  }
  
  const queue = getSubmissionQueue();
  if (queue.length === 0) {
    return;
  }
  
  console.log(`Processing ${queue.length} queued submissions`);
  
  // Process submissions in order
  const updatedQueue: QueuedFormSubmission[] = [];
  
  for (const submission of queue) {
    try {
      // Try to submit
      await api.post(submission.endpoint, submission.formData);
      console.log(`Successfully processed queued submission: ${submission.id}`);
      // Don't add this one back to the queue since it succeeded
    } catch (error) {
      // If submission failed, increment retry count
      const updatedSubmission = {
        ...submission,
        retryCount: submission.retryCount + 1
      };
      
      // If under max retries, add back to queue
      if (updatedSubmission.retryCount < MAX_RETRY_COUNT) {
        updatedQueue.push(updatedSubmission);
      } else {
        console.error(`Submission ${submission.id} has exceeded max retry count and will be dropped`);
      }
    }
  }
  
  // Update the queue
  saveSubmissionQueue(updatedQueue);
  
  // Schedule next retry with exponential backoff if there are items left
  if (updatedQueue.length > 0) {
    const nextRetryDelay = calculateNextRetryDelay(updatedQueue);
    setTimeout(() => processQueuedSubmissions(), nextRetryDelay);
  }
};

// Calculate retry delay using exponential backoff
const calculateNextRetryDelay = (queue: QueuedFormSubmission[]): number => {
  // Find the submission with the highest retry count
  const maxRetryCount = Math.max(...queue.map(sub => sub.retryCount));
  // Calculate delay with exponential backoff
  return INITIAL_RETRY_DELAY * Math.pow(EXPONENTIAL_BACKOFF_FACTOR, maxRetryCount);
};

// Clear the submission queue
export const clearSubmissionQueue = (): void => {
  localStorage.removeItem(QUEUE_STORAGE_KEY);
};

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

// Time Slot APIs
export const getAvailableTimeSlots = async (date: string, program: string) => {
  return await api.get(`/timeslots?date=${date}&program=${program}`);
};

export const reserveTimeSlot = async (timeSlotId: string, leadId: string) => {
  return await api.post(`/timeslots/${timeSlotId}/reserve`, { lead_id: leadId });
};

export const releaseTimeSlot = async (timeSlotId: string, leadId: string) => {
  return await api.post(`/timeslots/${timeSlotId}/release`, { lead_id: leadId });
};

// Analytics APIs - Original
export const trackPageVisit = async (pageVisit: Omit<PageVisit, 'id'>) => {
  return await api.post('/api/analytics/pageview', pageVisit);
};

export const trackConversion = async (conversion: Omit<Conversion, 'id'>) => {
  return await api.post('/api/analytics/event', {
    eventType: 'conversion',
    metadata: conversion
  });
};

export const getMetricsSnapshots = async (startDate: string, endDate: string) => {
  return await api.get(`/api/analytics/reports/page_views?startDate=${startDate}&endDate=${endDate}`);
};

// Enhanced Analytics APIs
export const getAnalyticsReport = async (startDate: string, endDate: string) => {
  const response = await api.get(`/api/analytics/reports/user_activity?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getLandingPageMetrics = async (startDate: string, endDate: string) => {
  const response = await api.get(`/api/analytics/reports/page_views?startDate=${startDate}&endDate=${endDate}&groupBy=page`);
  return response.data;
};

export const getTopTrafficSources = async (startDate: string, endDate: string) => {
  const response = await api.get(`/api/analytics/reports/page_views?startDate=${startDate}&endDate=${endDate}&groupBy=referrer`);
  return response.data;
};

export const getDeviceBreakdown = async (startDate: string, endDate: string) => {
  const response = await api.get(`/api/analytics/reports/page_views?startDate=${startDate}&endDate=${endDate}&groupBy=device`);
  return response.data;
};

export const getGeographicDistribution = async (startDate: string, endDate: string) => {
  const response = await api.get(`/api/analytics/reports/page_views?startDate=${startDate}&endDate=${endDate}&groupBy=region`);
  return response.data;
};

export const getNewVsReturningMetrics = async (startDate: string, endDate: string) => {
  const response = await api.get(`/api/analytics/reports/user_activity?startDate=${startDate}&endDate=${endDate}&groupBy=visitor_type`);
  return response.data;
};

export const getAttributionAnalysis = async (startDate: string, endDate: string) => {
  const response = await api.get(`/api/analytics/reports/conversion?startDate=${startDate}&endDate=${endDate}&conversionGoal=all`);
  return response.data;
};

export const compareAttributionModels = async (startDate: string, endDate: string, models: string[]) => {
  const response = await api.post(`/api/analytics/reports/attribution_comparison`, {
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

// Form APIs
export const processForm = async (formData: any) => {
  // Use submit/:formType endpoint instead of /forms/process
  return await api.post(`/forms/submit/${formData.type || 'default'}`, formData);
};

export const submitAssessmentForm = async (formData: any) => {
  return await api.post('/forms/assessment', formData);
};

export const submitFreeClassForm = async (formData: any) => {
  try {
    console.log('\n============ FRONTEND - FREE CLASS FORM SUBMISSION ============');
    console.log('Submitting data to backend endpoint: /api/forms/go-high-level-submit');
    console.log('Form Data:', JSON.stringify(formData, null, 2));
    
    // Track start time for performance monitoring
    const startTime = performance.now();
    
    // Use our backend endpoint that directly forwards to Go High Level
    const response = await api.post('/api/forms/go-high-level-submit', formData);
    
    // Calculate request duration
    const duration = performance.now() - startTime;
    
    // Log complete response details
    console.log('\n============ FRONTEND - RESPONSE RECEIVED ============');
    console.log(`Response received in ${duration.toFixed(2)}ms`);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('============ END FRONTEND LOGGING ============\n');
    
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error: any) {
    console.error('\n============ FRONTEND - SUBMISSION ERROR ============');
    console.error('Error in free class form submission:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Request details:');
      console.error(error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    console.error('============ END ERROR LOGGING ============\n');
    
    throw error;
  }
};

export const submitContactForm = async (formData: any) => {
  return await api.post('/forms/contact', formData);
};

// Enhanced form submission with retries
const defaultSubmissionOptions = {
  retryCount: 2,
  retryDelay: 2000,
  trackProgress: true
};

export interface FormSubmissionOptions {
  retryCount?: number;
  retryDelay?: number; // ms
  trackProgress?: boolean;
}

export interface FormSubmissionResult {
  success: boolean;
  data?: any;
  error?: Error | string;
  attempts?: number;
}

export interface FormSubmissionProgress {
  status: 'idle' | 'submitting' | 'success' | 'error' | 'retrying';
  progress: number; // 0-100
  currentAttempt: number;
  maxAttempts: number;
  error?: Error | string;
}

// Form submission with offline support
export const submitFormWithRetry = async (
  endpoint: string,
  formData: any,
  options: FormSubmissionOptions = defaultSubmissionOptions,
  progressCallback?: (progress: FormSubmissionProgress) => void
): Promise<FormSubmissionResult> => {
  const { retryCount = 3, retryDelay = 2000, trackProgress = true } = options;
  
  // If offline, queue the submission and return a "pending" result
  if (!isOnline()) {
    const id = queueFormSubmission(endpoint, formData, options);
    
    if (progressCallback) {
      progressCallback({
        status: 'submitting',
        progress: 100,
        currentAttempt: 1,
        maxAttempts: 1,
        error: 'Device is offline, submission has been queued'
      });
    }
    
    return {
      success: false,
      data: { queued: true, submissionId: id },
      error: 'Device is offline, submission has been queued'
    };
  }

  // Regular submission flow for online state
  const updateProgress = (status: FormSubmissionProgress['status'], progress: number, error?: Error | string) => {
    if (trackProgress && progressCallback) {
      progressCallback({
        status,
        progress,
        currentAttempt: attempt,
        maxAttempts: retryCount + 1,
        error
      });
    }
  };

  let attempt = 1;
  let lastError: Error | string | undefined;

  while (attempt <= retryCount + 1) {
    try {
      updateProgress('submitting', 50);
      
      const response = await api.post(endpoint, formData);
      
      updateProgress('success', 100);
      
      return {
        success: true,
        data: response.data,
        attempts: attempt
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      lastError = errorMessage;
      
      if (attempt > retryCount) {
        // No more retry attempts
        updateProgress('error', 100, errorMessage);
        break;
      }
      
      // Prepare for retry
      updateProgress('retrying', (attempt / (retryCount + 1)) * 100, errorMessage);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      attempt++;
    }
  }

  // If all retries failed and we're online, queue the submission for later
  const id = queueFormSubmission(endpoint, formData, options);
  
  return {
    success: false,
    error: lastError,
    attempts: attempt,
    data: { queued: true, submissionId: id }
  };
};

// Main form submission function that determines endpoint based on form type
export const submitForm = async (
  formType: 'free-class' | 'assessment' | 'contact' | string,
  formData: any,
  options?: FormSubmissionOptions,
  progressCallback?: (progress: FormSubmissionProgress) => void
): Promise<FormSubmissionResult> => {
  // If we're offline, queue the form submission and return
  if (!isOnline()) {
    console.log('Device is offline. Queueing form submission for later.');
    const endpoint = getEndpointForFormType(formType);
    const id = queueFormSubmission(endpoint, formData, options);
    
    if (progressCallback) {
      progressCallback({
        status: 'error',
        progress: 0,
        currentAttempt: 0,
        maxAttempts: options?.retryCount || 3,
        error: 'Device is offline. Form will be submitted when connection is restored.'
      });
    }
    
    return {
      success: false,
      error: 'Device is offline. Form will be submitted when connection is restored.',
      attempts: 0,
      data: { queued: true, submissionId: id }
    };
  }
  
  // For online submissions, use the retry mechanism
  const endpoint = getEndpointForFormType(formType);
  return submitFormWithRetry(endpoint, formData, options, progressCallback);
};

/**
 * Get the appropriate endpoint for a form type
 */
const getEndpointForFormType = (formType: string): string => {
  switch (formType) {
    case 'free-class':
      return '/form/free-class';
    case 'assessment':
      return '/form/assessment';
    case 'contact':
      return '/form/contact';
    // Support appointment booking directly
    case 'appointment': 
      return '/appointment/create';
    default:
      // Fallback to general form processing
      return `/form/${formType}`;
  }
};

// Analytics reporting APIs
export const getMetricsByReportType = async (reportType: string, limit: number = 30) => {
  const response = await api.get(`/analytics/metrics/${reportType}`, {
    params: { limit }
  });
  
  if (response.status !== 200) {
    throw new Error(`Failed to fetch ${reportType} metrics`);
  }
  
  return response.data;
};

// Get the latest metric for a specific report type
export const getLatestMetricByReportType = async (reportType: string) => {
  const response = await api.get(`/analytics/metrics/${reportType}/latest`);
  
  if (response.status !== 200) {
    throw new Error(`Failed to fetch latest ${reportType} metric`);
  }
  
  return response.data;
};

// Get the latest traffic sources with optional filtering
export const getLatestTrafficSources = async (reportType?: string) => {
  const params: any = {};
  
  if (reportType) {
    params.reportType = reportType;
  }
  
  const response = await api.get('/analytics/traffic-sources/latest', {
    params
  });
  
  if (response.status !== 200) {
    throw new Error('Failed to fetch latest traffic sources');
  }
  
  return response.data;
};

// Get conversion rate trend data
export const getConversionRateTrend = async (period: string = 'daily') => {
  const response = await api.get('/analytics/conversion-trend', {
    params: { period }
  });
  
  if (response.status !== 200) {
    throw new Error(`Failed to fetch conversion trend data`);
  }
  
  return response.data;
};

// Update the appointment submission function to use the new client
export const submitAppointmentRequest = async (formData: any): Promise<any> => {
  return goHighLevelAppointmentClient.submitAppointmentRequest(formData);
};

export default api; 