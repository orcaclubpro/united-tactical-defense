import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for our API data
export interface Lead {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source?: string;
  potentialValue?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id?: number;
  lead_id: number;
  title: string;
  appointment_time: string;
  duration?: number;
  notes?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PageVisit {
  id?: number;
  pageUrl: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  userAgent?: string;
  ipAddress?: string;
  is_landing_page?: number;
  visit_time: string;
}

export interface Conversion {
  id?: number;
  visit_id: number;
  conversion_type: string;
  conversion_value?: number;
  conversion_data?: string;
  conversion_time: string;
}

export interface MetricsSnapshot {
  id?: number;
  landing_page_visits: number;
  conversions: number;
  referral_counts: string;
  snapshot_time: string;
}

// API functions
// Leads
export const getLeads = () => api.get('/leads');
export const getLead = (id: number) => api.get(`/leads/${id}`);
export const createLead = (lead: Lead) => api.post('/leads', lead);
export const updateLead = (id: number, lead: Lead) => api.put(`/leads/${id}`, lead);
export const deleteLead = (id: number) => api.delete(`/leads/${id}`);

// Appointments
export const getAppointments = () => api.get('/appointments');
export const getAppointment = (id: number) => api.get(`/appointments/${id}`);
export const createAppointment = (appointment: Appointment) => api.post('/appointments', appointment);
export const updateAppointment = (id: number, appointment: Appointment) => 
  api.put(`/appointments/${id}`, appointment);
export const deleteAppointment = (id: number) => api.delete(`/appointments/${id}`);

// Analytics
export const getPageVisits = (dateRange?: { start: string, end: string }) => 
  api.get('/analytics/page-visits', { params: dateRange });
export const getConversions = (dateRange?: { start: string, end: string }) => 
  api.get('/analytics/conversions', { params: dateRange });
export const getMetricsSnapshots = (dateRange?: { start: string, end: string }) => 
  api.get('/analytics/metrics-snapshots', { params: dateRange });
export const getTrafficSources = (dateRange?: { start: string, end: string }) => 
  api.get('/analytics/traffic-sources', { params: dateRange });
export const getConversionRate = (dateRange?: { start: string, end: string }) => 
  api.get('/analytics/conversion-rate', { params: dateRange });

// Form handling
export const submitAssessmentForm = (formData: any) => api.post('/form/assessment', formData);
export const submitFreeClassForm = (formData: any) => api.post('/form/free-class', formData);
export const submitContactForm = (formData: any) => api.post('/form/contact', formData);

// Track page visit
export const trackPageVisit = (pageVisit: PageVisit) => api.post('/analytics/track/visit', pageVisit);

export default api; 