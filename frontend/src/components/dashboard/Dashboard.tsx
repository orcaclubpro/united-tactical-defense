import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './layout';
import { DateRangePicker, DateRange } from './filters';
import { 
  VisitsChart, 
  DeviceChart, 
  TrafficSourcesChart, 
  ConversionChart,
  GeographicChart,
  VisitorMetricsChart
} from './charts';
import { MetricCard } from './cards';
import { 
  getAnalyticsReport, 
  getLandingPageMetrics, 
  getTopTrafficSources,
  getDeviceBreakdown,
  getGeographicDistribution,
  getNewVsReturningMetrics,
  getMetricsByReportType,
  getLatestMetricByReportType,
  getLatestTrafficSources,
  getConversionRateTrend
} from '../../services/api';
import './Dashboard.scss';

type ReportType = 'realtime' | 'daily' | 'weekly' | 'monthly';

interface TrafficSource {
  source: string;
  visits: number;
}

interface DeviceData {
  device: string;
  count: number;
}

interface GeoData {
  region: string;
  count: number;
}

interface MetricsSnapshot {
  id: number;
  landing_page_visits: number;
  conversions: number;
  referral_counts: Record<string, number>;
  devices: Record<string, number>;
  geography: Record<string, number>;
  report_type: string;
  snapshot_time: string;
  average_time_per_user?: number;
}

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return date.toISOString().split('T')[0];
    })(),
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState<ReportType>('realtime');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(60 * 60 * 1000); // 1 hour
  
  // Analytics data states
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    conversionRate: 0,
    averageEngagementTime: 0
  });
  const [pageMetrics, setPageMetrics] = useState<{
    date: string;
    visits: number;
  }[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [geoData, setGeoData] = useState<GeoData[]>([]);
  const [visitorMetrics, setVisitorMetrics] = useState<{
    date: string;
    newVisitors: number;
    returningVisitors: number;
  }[]>([]);
  const [conversionData, setConversionData] = useState<{
    date: string;
    visits: number;
    conversions: number;
  }[]>([]);
  
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      if (reportType === 'realtime') {
        // Fetch summary metrics
        const reportData = await getAnalyticsReport(dateRange.startDate, dateRange.endDate);
        setSummaryMetrics({
          totalVisits: reportData.totalVisits,
          uniqueVisitors: reportData.uniqueVisitors,
          conversionRate: reportData.conversionRate,
          averageEngagementTime: reportData.averageEngagementTime
        });
        
        // Fetch page metrics (visits over time)
        const metricsData = await getLandingPageMetrics(dateRange.startDate, dateRange.endDate);
        setPageMetrics(metricsData.dailyVisits);
        setConversionData(metricsData.conversionData);
        
        // Fetch device breakdown
        const deviceBreakdown = await getDeviceBreakdown(dateRange.startDate, dateRange.endDate);
        setDeviceData(deviceBreakdown.devices);
        
        // Fetch geographic distribution
        const geoDistribution = await getGeographicDistribution(dateRange.startDate, dateRange.endDate);
        setGeoData(geoDistribution.regions);
        
        // Fetch new vs returning visitor metrics
        const visitorData = await getNewVsReturningMetrics(dateRange.startDate, dateRange.endDate);
        setVisitorMetrics(visitorData.dailyMetrics);
      } else {
        // Fetch data from reports (daily, weekly, monthly)
        const reportData = await getLatestMetricByReportType(reportType);
        
        if (reportData) {
          const { landing_page_visits, conversions, referral_counts, devices, geography, average_time_per_user } = reportData as MetricsSnapshot;
          
          // Set summary metrics
          setSummaryMetrics({
            totalVisits: landing_page_visits,
            uniqueVisitors: Math.round(landing_page_visits * 0.7), // Approximate unique visitors
            conversionRate: conversions > 0 ? (conversions / landing_page_visits * 100) : 0,
            averageEngagementTime: average_time_per_user || 0 // Use stored average time
          });
          
          // Transform referral counts to array format
          const sourcesArray = Object.entries(referral_counts || {}).map(([source, count]) => ({
            source,
            visits: count // Use 'visits' instead of 'count' to match TrafficSource interface
          })).sort((a, b) => b.visits - a.visits);
          setTrafficSources(sourcesArray);
          
          // Transform devices to array format
          const devicesArray = Object.entries(devices || {}).map(([device, count]) => ({
            device,
            count
          })).sort((a, b) => b.count - a.count);
          setDeviceData(devicesArray);
          
          // Transform geography to array format
          const geoArray = Object.entries(geography || {}).map(([region, count]) => ({
            region,
            count
          })).sort((a, b) => b.count - a.count);
          setGeoData(geoArray);
        }
        
        // Get historical report data for trend charts
        const reportsHistory = await getMetricsByReportType(reportType, 30);
        
        if (reportsHistory && reportsHistory.length > 0) {
          // Transform to page metrics format
          const pageMetricsData = reportsHistory.map((report: MetricsSnapshot) => ({
            date: new Date(report.snapshot_time).toISOString().split('T')[0],
            visits: report.landing_page_visits
          })).reverse();
          
          setPageMetrics(pageMetricsData);
          
          // Transform to conversion data format
          const conversionMetricsData = reportsHistory.map((report: MetricsSnapshot) => ({
            date: new Date(report.snapshot_time).toISOString().split('T')[0],
            visits: report.landing_page_visits,
            conversions: report.conversions
          })).reverse();
          
          setConversionData(conversionMetricsData);
        }
      }
      
      // Always get fresh traffic sources data
      await fetchTrafficSources();
      
      // Get conversion rate trend
      await fetchConversionRateTrend();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set mock data for demo purposes
      setMockData();
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTrafficSources = async () => {
    try {
      // Get latest traffic sources with optional report type
      const sourcesData = await getLatestTrafficSources(reportType !== 'realtime' ? reportType : undefined);
      setTrafficSources(sourcesData.sources);
    } catch (error) {
      console.error('Error fetching traffic sources:', error);
    }
  };
  
  const fetchConversionRateTrend = async () => {
    try {
      // Get conversion rate trend based on report type
      const period = reportType === 'weekly' ? 'weekly' : 
                     reportType === 'monthly' ? 'monthly' : 'daily';
      
      const conversionTrend = await getConversionRateTrend(period);
      
      if (conversionTrend && conversionTrend.length > 0) {
        setConversionData(conversionTrend);
      }
    } catch (error) {
      console.error('Error fetching conversion rate trend:', error);
    }
  };
  
  // Set mock data for development and demo purposes
  const setMockData = () => {
    // Summary metrics
    setSummaryMetrics({
      totalVisits: 12548,
      uniqueVisitors: 8792,
      conversionRate: 3.8,
      averageEngagementTime: 128
    });
    
    // Page visits
    const today = new Date();
    const mockPageMetrics = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - 29 + i);
      return {
        date: date.toISOString().split('T')[0],
        visits: Math.floor(Math.random() * 300) + 200
      };
    });
    setPageMetrics(mockPageMetrics);
    
    // Traffic sources
    setTrafficSources([
      { source: 'Google', visits: 4853 },
      { source: 'Direct', visits: 2945 },
      { source: 'Facebook', visits: 1876 },
      { source: 'Twitter', visits: 978 },
      { source: 'LinkedIn', visits: 598 },
      { source: 'Other', visits: 1298 }
    ]);
    
    // Device breakdown
    setDeviceData([
      { device: 'Desktop', count: 5632 },
      { device: 'Mobile', count: 6158 },
      { device: 'Tablet', count: 758 }
    ]);
    
    // Geographic distribution
    setGeoData([
      { region: 'United States', count: 5847 },
      { region: 'United Kingdom', count: 1289 },
      { region: 'Canada', count: 987 },
      { region: 'Australia', count: 756 },
      { region: 'Germany', count: 532 },
      { region: 'France', count: 423 },
      { region: 'Other', count: 2714 }
    ]);
    
    // Visitor metrics
    const mockVisitorMetrics = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - 29 + i);
      return {
        date: date.toISOString().split('T')[0],
        newVisitors: Math.floor(Math.random() * 200) + 100,
        returningVisitors: Math.floor(Math.random() * 100) + 50
      };
    });
    setVisitorMetrics(mockVisitorMetrics);
    
    // Conversion data
    const mockConversionData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - 29 + i);
      const visits = Math.floor(Math.random() * 300) + 200;
      return {
        date: date.toISOString().split('T')[0],
        visits: visits,
        conversions: Math.floor(visits * (Math.random() * 0.05 + 0.01))
      };
    });
    setConversionData(mockConversionData);
  };
  
  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };
  
  const formatTimeInMinutes = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  const getPercentageChange = (current: number, previous: number): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change)),
      isPositive: change >= 0
    };
  };
  
  const handleReportTypeChange = (type: ReportType) => {
    setReportType(type);
    
    // Adjust refresh interval based on report type
    if (type === 'realtime') {
      setRefreshInterval(60 * 60 * 1000); // 1 hour for realtime
    } else {
      setRefreshInterval(null); // No auto-refresh for historical reports
    }
  };
  
  const handleBackToSite = () => {
    window.location.href = '/';
  };
  
  // Load data on mount and when parameters change
  useEffect(() => {
    loadDashboardData();
    
    // Setup refresh interval for traffic sources
    let trafficSourcesInterval: NodeJS.Timeout | null = null;
    
    if (refreshInterval && reportType === 'realtime') {
      trafficSourcesInterval = setInterval(() => {
        fetchTrafficSources();
      }, refreshInterval);
    }
    
    return () => {
      if (trafficSourcesInterval) {
        clearInterval(trafficSourcesInterval);
      }
    };
  }, [dateRange, reportType, refreshInterval]);
  
  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <div className="dashboard-actions">
          <button 
            className="btn btn-secondary back-button"
            onClick={handleBackToSite}
          >
            Back to Site
          </button>
        </div>
      </div>
      
      <div className="dashboard-filters">
        <div className="report-type-selector">
          <h3>Report Type</h3>
          <div className="btn-group">
            <button 
              className={`btn ${reportType === 'realtime' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleReportTypeChange('realtime')}
            >
              Realtime
            </button>
            <button 
              className={`btn ${reportType === 'daily' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleReportTypeChange('daily')}
            >
              Daily
            </button>
            <button 
              className={`btn ${reportType === 'weekly' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleReportTypeChange('weekly')}
            >
              Weekly
            </button>
            <button 
              className={`btn ${reportType === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleReportTypeChange('monthly')}
            >
              Monthly
            </button>
          </div>
        </div>
        
        {reportType === 'realtime' && (
          <DateRangePicker 
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        )}
      </div>
      
      <div className="dashboard-summary">
        <MetricCard
          title="Total Visits"
          value={summaryMetrics.totalVisits.toLocaleString()}
          change={getPercentageChange(summaryMetrics.totalVisits, summaryMetrics.totalVisits * 0.9)}
          icon="chart-line"
        />
        <MetricCard
          title="Unique Visitors"
          value={summaryMetrics.uniqueVisitors.toLocaleString()}
          change={getPercentageChange(summaryMetrics.uniqueVisitors, summaryMetrics.uniqueVisitors * 0.85)}
          icon="users"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${summaryMetrics.conversionRate.toFixed(2)}%`}
          change={getPercentageChange(summaryMetrics.conversionRate, summaryMetrics.conversionRate * 0.95)}
          icon="percentage"
        />
        <MetricCard
          title="Avg. Engagement Time"
          value={formatTimeInMinutes(summaryMetrics.averageEngagementTime)}
          change={getPercentageChange(summaryMetrics.averageEngagementTime, summaryMetrics.averageEngagementTime * 1.05)}
          icon="clock"
        />
      </div>
      
      <div className="dashboard-row">
        <div className="dashboard-column col-8">
          <div className="dashboard-card">
            <h3>Visitor Traffic</h3>
            <VisitsChart data={pageMetrics} />
          </div>
        </div>
        <div className="dashboard-column col-4">
          <div className="dashboard-card">
            <h3>Traffic Sources</h3>
            <TrafficSourcesChart data={trafficSources} />
            <div className="update-info">
              {reportType === 'realtime' ? 'Updates hourly' : `Last ${reportType} report`}
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-row">
        <div className="dashboard-column col-6">
          <div className="dashboard-card">
            <h3>Conversion Rate Trend</h3>
            <ConversionChart data={conversionData} />
          </div>
        </div>
        <div className="dashboard-column col-6">
          <div className="dashboard-card">
            <h3>Visitor Devices</h3>
            <DeviceChart data={deviceData} />
          </div>
        </div>
      </div>
      
      <div className="dashboard-row">
        <div className="dashboard-column col-6">
          <div className="dashboard-card">
            <h3>Geographic Distribution</h3>
            <GeographicChart data={geoData} />
          </div>
        </div>
        {reportType === 'realtime' && (
          <div className="dashboard-column col-6">
            <div className="dashboard-card">
              <h3>New vs Returning Visitors</h3>
              <VisitorMetricsChart data={visitorMetrics} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard; 