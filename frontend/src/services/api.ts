import axios from 'axios';
import { logMockOperation, simulateNetworkDelay } from '../utils/mockUtils';

// Create a placeholder axios instance that won't actually be used for API calls
// This is retained for type compatibility only
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
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
  // Additional fields required by Dashboard component
  snapshot_time: string;
  landing_page_visits: number;
  conversions: number;
  referral_counts: {
    source: string;
    count: number;
  }[];
  devices: {
    device: string;
    count: number;
  }[];
  geography: {
    region: string;
    count: number;
  }[];
  average_time_per_user: number;
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

export interface TrafficSource {
  source: string;
  visits: number;
}

// Mock data generator helpers
const generateId = () => Math.random().toString(36).substring(2, 15);
// Using randomDate helper in some mock data generators below
const randomDate = (start = new Date(2023, 0, 1), end = new Date()) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Mock lead data
const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    program: 'Defense Training',
    source: 'Website',
    status: 'New',
    notes: 'Interested in weekend classes',
    created_at: '2023-05-15T10:30:00Z'
  },
  {
    id: 'lead-2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 987-6543',
    program: 'Tactical Training',
    source: 'Referral',
    status: 'Contacted',
    notes: 'Has previous experience',
    created_at: '2023-05-18T14:15:00Z'
  }
];

// Mock appointment data
const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    lead_id: 'lead-1',
    date: '2023-06-10',
    time: '10:00 AM',
    type: 'Initial Consultation',
    status: 'Scheduled',
    notes: 'First time visit'
  },
  {
    id: 'apt-2',
    lead_id: 'lead-2',
    date: '2023-06-12',
    time: '2:30 PM',
    type: 'Free Trial Class',
    status: 'Confirmed',
    notes: 'Bring comfortable clothes'
  }
];

// ==========================================================================
// PLACEHOLDER IMPLEMENTATIONS - BEGIN
// All backend API functions below are replaced with mock implementations
// that return static data rather than making actual API calls
// ==========================================================================

// Lead APIs - Mock implementations
export const getLeads = async () => {
  logMockOperation('getLeads');
  await simulateNetworkDelay();
  return Promise.resolve({ data: mockLeads });
};

export const getLeadById = async (id: string) => {
  logMockOperation('getLeadById', { id });
  await simulateNetworkDelay();
  const lead = mockLeads.find(l => l.id === id);
  return Promise.resolve({ data: lead });
};

export const createLead = async (lead: Omit<Lead, 'id' | 'created_at'>) => {
  logMockOperation('createLead', lead);
  await simulateNetworkDelay();
  const newLead: Lead = {
    ...lead,
    id: `lead-${generateId()}`,
    created_at: new Date().toISOString()
  } as Lead;
  
  return Promise.resolve({ data: newLead });
};

export const updateLead = async (id: string, lead: Partial<Lead>) => {
  logMockOperation('updateLead', { id, lead });
  await simulateNetworkDelay();
  return Promise.resolve({ data: { ...lead, id } });
};

export const deleteLead = async (id: string) => {
  logMockOperation('deleteLead', { id });
  await simulateNetworkDelay();
  return Promise.resolve({ data: { success: true, id } });
};

// Appointment APIs - Mock implementations
export const getAppointments = async () => {
  try {
    // Make a real API call to get appointments from the backend
    const baseURL = process.env.REACT_APP_API_BASE_URL || '/api';
    const response = await fetch(`${baseURL}/submit-appointment`);
    if (!response.ok) {
      throw new Error(`Failed to fetch appointments: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    // Fall back to mock data in case of failure
    return Promise.resolve({ data: mockAppointments });
  }
};

export const getAppointmentById = async (id: string) => {
  // PLACEHOLDER: Returns a mock appointment based on ID
  const appointment = mockAppointments.find(a => a.id === id);
  return Promise.resolve({ data: appointment });
};

export const createAppointment = async (appointment: Omit<Appointment, 'id'>) => {
  // PLACEHOLDER: Simulates creating a new appointment
  const newAppointment: Appointment = {
    ...appointment,
    id: `apt-${generateId()}`
  } as Appointment;
  
  return Promise.resolve({ data: newAppointment });
};

export const updateAppointment = async (id: string, appointment: Partial<Appointment>) => {
  // PLACEHOLDER: Simulates updating appointment data
  return Promise.resolve({ data: { ...appointment, id } });
};

export const deleteAppointment = async (id: string) => {
  // PLACEHOLDER: Simulates deleting an appointment
  return Promise.resolve({ data: { success: true, id } });
};

// Analytics APIs - Mock implementations
export const trackPageVisit = async (pageVisit: Omit<PageVisit, 'id'>) => {
  // PLACEHOLDER: Simulates tracking a page visit
  const newPageVisit: PageVisit = {
    ...pageVisit,
    id: `visit-${generateId()}`,
    timestamp: new Date().toISOString()
  } as PageVisit;
  
  return Promise.resolve({ data: newPageVisit });
};

export const trackConversion = async (conversion: Omit<Conversion, 'id'>) => {
  // PLACEHOLDER: Simulates tracking a conversion
  const newConversion: Conversion = {
    ...conversion,
    id: `conv-${generateId()}`,
    timestamp: new Date().toISOString()
  } as Conversion;
  
  return Promise.resolve({ data: newConversion });
};

export const getMetricsSnapshots = async (startDate: string, endDate: string) => {
  // PLACEHOLDER: Generates mock metrics snapshots for the date range
  const mockMetrics: MetricsSnapshot[] = Array.from({ length: 7 }, (_, i) => ({
    id: `metric-${i}`,
    date: new Date(new Date(startDate).getTime() + i * 86400000).toISOString().split('T')[0],
    visits: Math.floor(Math.random() * 1000) + 500,
    unique_visitors: Math.floor(Math.random() * 800) + 400,
    average_time_on_page: Math.floor(Math.random() * 180) + 60,
    bounce_rate: Math.random() * 0.7,
    conversion_rate: Math.random() * 0.15,
    // Additional fields required by Dashboard
    snapshot_time: new Date(new Date(startDate).getTime() + i * 86400000).toISOString(),
    landing_page_visits: Math.floor(Math.random() * 800) + 300,
    conversions: Math.floor(Math.random() * 100) + 20,
    referral_counts: [
      { source: 'Google', count: Math.floor(Math.random() * 300) + 100 },
      { source: 'Facebook', count: Math.floor(Math.random() * 200) + 80 },
      { source: 'Direct', count: Math.floor(Math.random() * 150) + 50 }
    ],
    devices: [
      { device: 'Mobile', count: Math.floor(Math.random() * 400) + 200 },
      { device: 'Desktop', count: Math.floor(Math.random() * 300) + 150 },
      { device: 'Tablet', count: Math.floor(Math.random() * 100) + 30 }
    ],
    geography: [
      { region: 'California', count: Math.floor(Math.random() * 200) + 100 },
      { region: 'Texas', count: Math.floor(Math.random() * 150) + 70 },
      { region: 'Florida', count: Math.floor(Math.random() * 100) + 50 }
    ],
    average_time_per_user: Math.floor(Math.random() * 200) + 60
  }));
  
  return Promise.resolve({ data: mockMetrics });
};

// Enhanced Analytics APIs - Mock implementations
export const getAnalyticsReport = async (startDate: string, endDate: string) => {
  // PLACEHOLDER: Returns mock analytics report data structured for Dashboard
  return {
    // Match Dashboard component expectations
    totalVisits: 12500,
    uniqueVisitors: 8700,
    conversionRate: 0.067,
    averageEngagementTime: 185,
    bounceRate: 0.34,
    periodSummary: {
      totalVisits: 12500,
      uniqueVisitors: 8700,
      averageSessionDuration: 185,
      bounceRate: 0.34,
      conversionRate: 0.067
    },
    trends: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(new Date(startDate).getTime() + i * 86400000).toISOString().split('T')[0],
      visits: Math.floor(Math.random() * 1000) + 500,
      conversions: Math.floor(Math.random() * 50) + 10
    }))
  };
};

export const getLandingPageMetrics = async (startDate: string, endDate: string) => {
  // PLACEHOLDER: Returns mock landing page metrics with data structure for Dashboard
  return {
    pages: [
      { page: '/', visits: 5240, bounceRate: 0.31, conversionRate: 0.072 },
      { page: '/programs', visits: 3120, bounceRate: 0.28, conversionRate: 0.085 },
      { page: '/about', visits: 1840, bounceRate: 0.42, conversionRate: 0.043 },
      { page: '/contact', visits: 2300, bounceRate: 0.25, conversionRate: 0.091 }
    ],
    // Additional fields required by Dashboard
    dailyVisits: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(new Date(startDate).getTime() + i * 86400000).toISOString().split('T')[0],
      visits: Math.floor(Math.random() * 1000) + 200
    })),
    conversionData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(new Date(startDate).getTime() + i * 86400000).toISOString().split('T')[0],
      visits: Math.floor(Math.random() * 1000) + 200,
      conversions: Math.floor(Math.random() * 50) + 5
    }))
  };
};

export const getTopTrafficSources = async (startDate: string, endDate: string) => {
  // PLACEHOLDER: Returns mock traffic sources data
  return {
    sources: [
      { source: 'Google', visits: 4200, conversionRate: 0.068 },
      { source: 'Direct', visits: 3100, conversionRate: 0.071 },
      { source: 'Facebook', visits: 2700, conversionRate: 0.059 },
      { source: 'Instagram', visits: 1840, conversionRate: 0.082 },
      { source: 'Referral', visits: 660, conversionRate: 0.054 }
    ]
  };
};

export const getDeviceBreakdown = async (startDate: string, endDate: string) => {
  // PLACEHOLDER: Returns mock device breakdown data
  return {
    devices: [
      { device: 'Mobile', count: 6700 },
      { device: 'Desktop', count: 4800 },
      { device: 'Tablet', count: 1000 }
    ]
  };
};

export const getGeographicDistribution = async (startDate: string, endDate: string) => {
  // PLACEHOLDER: Returns mock geographic distribution data
  return {
    regions: [
      { region: 'California', count: 3200 },
      { region: 'Texas', count: 2100 },
      { region: 'New York', count: 1800 },
      { region: 'Florida', count: 1500 },
      { region: 'Other', count: 3900 }
    ]
  };
};

export const getNewVsReturningMetrics = async (startDate: string, endDate: string) => {
  // PLACEHOLDER: Returns mock visitor metrics data
  return {
    dailyMetrics: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(new Date(startDate).getTime() + i * 86400000).toISOString().split('T')[0],
      newVisitors: Math.floor(Math.random() * 500) + 200,
      returningVisitors: Math.floor(Math.random() * 300) + 100
    }))
  };
};

export const getAttributionAnalysis = async (startDate: string, endDate: string) => {
  // PLACEHOLDER: Returns mock attribution analysis data
  return {
    channels: [
      { channel: 'Organic Search', contribution: 0.42 },
      { channel: 'Social Media', contribution: 0.28 },
      { channel: 'Direct', contribution: 0.18 },
      { channel: 'Referral', contribution: 0.08 },
      { channel: 'Email', contribution: 0.04 }
    ]
  };
};

export const compareAttributionModels = async (startDate: string, endDate: string, models: string[]) => {
  // PLACEHOLDER: Returns mock attribution model comparison data
  return {
    models: [
      {
        name: 'First Touch',
        channels: [
          { channel: 'Organic Search', contribution: 0.47 },
          { channel: 'Social Media', contribution: 0.25 },
          { channel: 'Direct', contribution: 0.16 },
          { channel: 'Referral', contribution: 0.07 },
          { channel: 'Email', contribution: 0.05 }
        ]
      },
      {
        name: 'Last Touch',
        channels: [
          { channel: 'Organic Search', contribution: 0.38 },
          { channel: 'Social Media', contribution: 0.30 },
          { channel: 'Direct', contribution: 0.22 },
          { channel: 'Referral', contribution: 0.06 },
          { channel: 'Email', contribution: 0.04 }
        ]
      }
    ]
  };
};

export const getAnalyticsInsights = async (startDate: string, endDate: string) => {
  // PLACEHOLDER: Returns mock analytics insights data
  return {
    insights: [
      {
        id: 'insight-1',
        title: 'Mobile conversion rate improved',
        description: 'Your mobile conversion rate has increased by 15% over the last 30 days.',
        impact: 'high' as const,
        category: 'performance',
        date: new Date().toISOString()
      },
      {
        id: 'insight-2',
        title: 'High bounce rate on program page',
        description: 'The programs page has a higher than average bounce rate (58%).',
        impact: 'medium' as const,
        category: 'user experience',
        date: new Date().toISOString()
      }
    ]
  };
};

export const getOptimizationSuggestions = async (startDate: string, endDate: string) => {
  // PLACEHOLDER: Returns mock optimization suggestions data
  return {
    suggestions: [
      {
        id: 'sug-1',
        title: 'Improve mobile form usability',
        description: 'Mobile users abandon forms at a 25% higher rate than desktop users.',
        expectedImpact: 'Potential 10-15% increase in mobile conversions',
        difficulty: 'medium' as const,
        category: 'user experience'
      },
      {
        id: 'sug-2',
        title: 'Add testimonials to landing page',
        description: 'Pages with testimonials have 18% higher conversion rate.',
        expectedImpact: 'Potential 5-10% increase in landing page conversions',
        difficulty: 'easy' as const,
        category: 'content'
      }
    ]
  };
};

// Form Handling - Mock implementations
export const processForm = async (formData: any) => {
  // PLACEHOLDER: Simulates form submission processing
  return Promise.resolve({ 
    data: { 
      success: true, 
      message: 'Form submitted successfully', 
      formId: `form-${generateId()}` 
    } 
  });
};

// Legacy form handlers
export const submitAssessmentForm = async (formData: any) => {
  // PLACEHOLDER: Simulates assessment form submission
  return Promise.resolve({ 
    data: { 
      success: true, 
      message: 'Assessment form processed successfully', 
      formId: `assessment-${generateId()}` 
    } 
  });
};

// Function to format date with timezone offset for Pacific Time (-07:00 during DST)
const formatDateWithTimezone = (date: Date, timeString: string): string => {
  // Parse hours and minutes from timeString (format: HH:MM)
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Create a new date with the specific time
  const dateTime = new Date(date);
  dateTime.setHours(hours, minutes, 0, 0);
  
  // Format to ISO string and replace the Z with -07:00 for Pacific Time
  return dateTime.toISOString().replace(/\.\d+Z$/, '-07:00');
};

export const submitFreeClassForm = async (formData: any) => {
  try {
    // Create a standardized userData object matching the required format
    const userData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: typeof formData.phone === 'string' ? formData.phone.replace(/\D/g, '') : formData.phone,
      selected_slot: formData.appointmentDate && formData.appointmentTime
        ? new Date(
            formData.appointmentDate.setHours(
              parseInt(formData.appointmentTime.split(':')[0]),
              parseInt(formData.appointmentTime.split(':')[1].split(' ')[0]),
              0
            )
          ).toISOString()
        : new Date().toISOString(),
      tag: "landing" // Add tag field to the userData object
    };

    console.log('🔄 Submitting appointment data to backend:', {
      endpoint: '/api/submit-appointment',
      method: 'POST',
      userData
    });

    // Submit to the backend endpoint
    const response = await fetch('/api/submit-appointment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('📥 Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = 'An error occurred while submitting the form';
      try {
        const errorData = await response.json();
        console.error('❌ Error response data:', errorData);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error('❌ Failed to parse error response:', e);
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('✅ Appointment submission successful:', responseData);
    
    return { 
      data: { 
        success: true, 
        message: responseData.message || 'Free class form submitted successfully', 
        appointmentId: responseData.appointmentId,
        appointmentDetails: responseData.appointmentDetails || {
          date: formData.appointmentDate?.toISOString().split('T')[0],
          time: formData.appointmentTime,
        }
      } 
    };
  } catch (error) {
    console.error('❌ Error submitting free class form:', error);
    
    return {
      data: {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred while submitting the form'
      }
    };
  }
};

export const submitContactForm = async (formData: any) => {
  // PLACEHOLDER: Simulates contact form submission
  return Promise.resolve({ 
    data: { 
      success: true, 
      message: 'Contact form submitted successfully', 
      contactId: `contact-${generateId()}`
    } 
  });
};

export const getMetricsByReportType = async (reportType: string, limit: number = 30) => {
  // PLACEHOLDER: Returns mock metrics data by report type
  // Modified to return data in the structure expected by the Dashboard component
  return {
    reportType,
    data: Array.from({ length: limit }, (_, i) => ({
      date: new Date(new Date().getTime() - i * 86400000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 1000) + 100,
      change: Math.random() * 0.4 - 0.2 // between -20% and +20%
    })),
    length: limit, // Adding length property to satisfy the Dashboard component
    map: function<T>(callback: (item: any, index: number, array: any[]) => T): T[] {
      // Adding map function to satisfy the Dashboard component
      return this.data.map(callback);
    }
  };
};

export const getLatestMetricByReportType = async (reportType: string) => {
  // PLACEHOLDER: Returns mock latest metric by report type
  // Modified to match the expected MetricsSnapshot structure
  return {
    reportType,
    value: Math.floor(Math.random() * 1000) + 100,
    change: Math.random() * 0.4 - 0.2,
    lastUpdated: new Date().toISOString(),
    // Additional fields required by Dashboard
    id: `metric-${generateId()}`,
    snapshot_time: new Date().toISOString(),
    landing_page_visits: Math.floor(Math.random() * 800) + 300,
    conversions: Math.floor(Math.random() * 100) + 20,
    average_time_per_user: Math.floor(Math.random() * 200) + 60,
    referral_counts: [
      { source: 'Google', count: Math.floor(Math.random() * 300) + 100 },
      { source: 'Facebook', count: Math.floor(Math.random() * 200) + 80 },
      { source: 'Direct', count: Math.floor(Math.random() * 150) + 50 }
    ],
    devices: [
      { device: 'Mobile', count: Math.floor(Math.random() * 400) + 200 },
      { device: 'Desktop', count: Math.floor(Math.random() * 300) + 150 },
      { device: 'Tablet', count: Math.floor(Math.random() * 100) + 30 }
    ],
    geography: [
      { region: 'California', count: Math.floor(Math.random() * 200) + 100 },
      { region: 'Texas', count: Math.floor(Math.random() * 150) + 70 },
      { region: 'Florida', count: Math.floor(Math.random() * 100) + 50 }
    ]
  };
};

export const getLatestTrafficSources = async (reportType?: string) => {
  // PLACEHOLDER: Returns mock latest traffic sources data
  // Modified to return in the format expected by the Dashboard component
  return {
    sources: [
      { source: 'Google', visits: Math.floor(Math.random() * 1000) + 500 },
      { source: 'Direct', visits: Math.floor(Math.random() * 800) + 300 },
      { source: 'Facebook', visits: Math.floor(Math.random() * 600) + 200 },
      { source: 'Twitter', visits: Math.floor(Math.random() * 400) + 100 },
      { source: 'Referral', visits: Math.floor(Math.random() * 300) + 50 }
    ]
  };
};

export const getConversionRateTrend = async (period: string = 'daily') => {
  // PLACEHOLDER: Returns mock conversion rate trend data
  // Modified to match the structure expected by the Dashboard component
  const days = period === 'daily' ? 14 : period === 'weekly' ? 10 : 6;
  
  const data = Array.from({ length: days }, (_, i) => ({
    date: new Date(new Date().getTime() - i * 86400000).toISOString().split('T')[0],
    visits: Math.floor(Math.random() * 1000) + 200,
    conversions: Math.floor(Math.random() * 50) + 10
  }));
  
  return {
    period,
    data,
    length: data.length
  };
};

// ==========================================================================
// PLACEHOLDER IMPLEMENTATIONS - END
// ==========================================================================

// Add a mock API indicator to help with debugging
console.info('%c[MOCK API] Using mock API implementations - No backend connection required', 'color: #2ecc71; font-weight: bold; font-size: 14px;');

export default api; 
