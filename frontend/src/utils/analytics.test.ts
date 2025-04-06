/**
 * Tests for Google Analytics 4 tracking implementation
 */

import { 
  initializeGA4, 
  trackPageView, 
  trackFormSubmission, 
  trackTrafficSource, 
  getTrafficSource 
} from './analytics';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; }
  };
})();

// Mock window object with gtag
const originalWindow = { ...window };
const mockGtag = jest.fn();

describe('Google Analytics 4 Implementation Tests', () => {
  beforeEach(() => {
    // Setup mocks
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    Object.defineProperty(window, 'gtag', { value: mockGtag, writable: true });
    Object.defineProperty(window, 'dataLayer', { value: [], writable: true });
    
    // Clear localStorage before each test
    localStorageMock.clear();
    
    // Reset mocks
    mockGtag.mockClear();
  });
  
  afterAll(() => {
    // Restore original window
    Object.defineProperty(window, 'localStorage', { value: originalWindow.localStorage });
    // @ts-ignore
    window.gtag = undefined;
    // @ts-ignore
    window.dataLayer = undefined;
  });
  
  // Test GA4 initialization
  test('initializes GA4 correctly', () => {
    // Call the init function
    initializeGA4('G-TESTID123');
    
    // Verify gtag was called with correct parameters
    expect(mockGtag).toHaveBeenCalledWith('js', expect.any(Date));
    expect(mockGtag).toHaveBeenCalledWith('config', 'G-TESTID123', expect.objectContaining({
      send_page_view: true
    }));
  });
  
  // Test page view tracking
  test('tracks page views correctly', () => {
    trackPageView('/test-page', 'Test Page');
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({
      page_title: 'Test Page',
      page_path: '/test-page'
    }));
  });
  
  // Test form submission tracking
  test('tracks form submissions correctly', () => {
    const testFormData = {
      id: 'test-form-123',
      source: 'website',
      experience: 'beginner',
      appointmentDate: new Date('2023-06-15')
    };
    
    // Set a conversion ID for testing
    window.GA4_CONVERSION_ID = 'AW-12345/abcde';
    
    trackFormSubmission('free_lesson', testFormData);
    
    // Verify generate_lead event was tracked
    expect(mockGtag).toHaveBeenCalledWith('event', 'generate_lead', expect.objectContaining({
      form_type: 'free_lesson',
      form_id: 'test-form-123',
      form_source: 'website',
      experience_level: 'beginner'
    }));
    
    // Verify conversion event was tracked
    expect(mockGtag).toHaveBeenCalledWith('event', 'conversion', expect.objectContaining({
      send_to: 'AW-12345/abcde'
    }));
  });
  
  // Test traffic source tracking
  test('tracks and stores traffic source correctly', () => {
    // Mock document.referrer
    Object.defineProperty(document, 'referrer', { value: 'https://www.google.com/search?q=tactical+defense', configurable: true });
    
    // Track traffic source
    trackTrafficSource();
    
    // Verify user properties were set in gtag
    expect(mockGtag).toHaveBeenCalledWith('set', 'user_properties', expect.objectContaining({
      traffic_source: 'google',
      traffic_medium: 'organic'
    }));
    
    // Verify localStorage was updated
    expect(localStorageMock.getItem('traffic_source')).toBe('google');
    expect(localStorageMock.getItem('traffic_medium')).toBe('organic');
  });
  
  // Test UTM parameter handling
  test('handles UTM parameters correctly', () => {
    // Mock window.location.search
    const originalLocation = window.location;
    // @ts-ignore
    delete window.location;
    window.location = { 
      ...originalLocation,
      search: '?utm_source=facebook&utm_medium=cpc&utm_campaign=summer_promo'
    } as Location;
    
    // Track traffic source with UTM parameters
    trackTrafficSource();
    
    // Verify user properties were set correctly
    expect(mockGtag).toHaveBeenCalledWith('set', 'user_properties', expect.objectContaining({
      traffic_source: 'facebook',
      traffic_medium: 'cpc',
      utm_campaign: 'summer_promo'
    }));
    
    // Restore original location
    window.location = originalLocation;
  });
  
  // Test getting traffic source
  test('retrieves stored traffic source correctly', () => {
    // Set mock values in localStorage
    localStorageMock.setItem('traffic_source', 'instagram');
    localStorageMock.setItem('traffic_medium', 'social');
    localStorageMock.setItem('utm_campaign', 'spring_sale');
    
    // Get traffic source
    const source = getTrafficSource();
    
    // Verify returned object
    expect(source).toEqual({
      source: 'instagram',
      medium: 'social',
      campaign: 'spring_sale',
      content: null,
      term: null
    });
  });
});
