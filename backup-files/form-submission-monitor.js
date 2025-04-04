// Form Submission Monitor
// This script monitors actual form submissions to verify they are correctly formatted
// Now with optional live request sending capability

/**
 * Configuration options for the form monitor
 */
const CONFIG = {
  // Whether to allow actual sending of intercepted requests
  ALLOW_REAL_REQUESTS: false,
  
  // Expected form submission endpoint
  TARGET_ENDPOINT: 'https://backend.leadconnectorhq.com/appengine/appointment',
  
  // Whether to show detailed logs
  VERBOSE_LOGGING: true,
  
  // Fields that must be present in the form submission
  REQUIRED_FIELDS: [
    'first_name', 
    'last_name', 
    'phone', 
    'email', 
    'formId', 
    'location_id', 
    'calendar_id', 
    'selected_slot', 
    'selected_timezone'
  ]
};

/**
 * Set up a global XMLHttpRequest interceptor
 * This will capture any XHR/fetch requests made from the application
 */
function setupXHRInterceptor() {
  // Store original methods
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSend = XMLHttpRequest.prototype.send;
  const originalFetch = window.fetch;
  
  // Capture all relevant requests
  const capturedRequests = [];
  
  // Override open method to capture URL and method
  XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    this._method = method;
    return originalXhrOpen.apply(this, arguments);
  };
  
  // Override send method to capture data
  XMLHttpRequest.prototype.send = function(data) {
    const isFormRequest = this._url.includes('appointment') || 
                       this._url.includes('form') || 
                       this._url.includes('submit');
    
    if (isFormRequest) {
      console.log('[Form Monitor] Intercepted XHR request:');
      console.log('URL:', this._url);
      console.log('Method:', this._method);
      
      if (CONFIG.VERBOSE_LOGGING) {
        console.log('Headers:', this.getAllResponseHeaders());
        console.log('Data:', data);
      }
      
      capturedRequests.push({
        type: 'xhr',
        url: this._url,
        method: this._method,
        data: data,
        timestamp: new Date().toISOString()
      });
      
      // Analyze the data format
      analyzeFormSubmission(this._url, this._method, data);
      
      // Optionally block the actual request
      if (!CONFIG.ALLOW_REAL_REQUESTS && this._url.includes(CONFIG.TARGET_ENDPOINT)) {
        console.log('[Form Monitor] ⚠️ Blocked actual form submission (ALLOW_REAL_REQUESTS is disabled)');
        
        // Create a mock response
        setTimeout(() => {
          // Simulate a successful response
          Object.defineProperty(this, 'readyState', { value: 4 });
          Object.defineProperty(this, 'status', { value: 200 });
          Object.defineProperty(this, 'statusText', { value: 'OK (MOCKED)' });
          
          const mockResponse = JSON.stringify({
            success: true,
            message: 'This is a mocked success response. No actual request was sent.',
            timestamp: new Date().toISOString(),
            note: 'Set ALLOW_REAL_REQUESTS to true to allow actual submissions'
          });
          
          Object.defineProperty(this, 'responseText', { value: mockResponse });
          Object.defineProperty(this, 'response', { value: mockResponse });
          
          if (typeof this.onreadystatechange === 'function') {
            this.onreadystatechange();
          }
          if (typeof this.onload === 'function') {
            this.onload();
          }
        }, 500); // Delay to simulate network
        
        return; // Skip the actual request
      }
    }
    
    return originalXhrSend.apply(this, arguments);
  };
  
  // Override fetch to capture API calls
  window.fetch = function(url, options = {}) {
    const urlString = url.toString();
    const isFormRequest = urlString.includes('appointment') || 
                       urlString.includes('form') || 
                       urlString.includes('submit');
    
    if (isFormRequest) {
      console.log('[Form Monitor] Intercepted fetch request:');
      console.log('URL:', urlString);
      console.log('Method:', options.method || 'GET');
      
      if (CONFIG.VERBOSE_LOGGING) {
        console.log('Headers:', options.headers);
        console.log('Body:', options.body);
      }
      
      capturedRequests.push({
        type: 'fetch',
        url: urlString,
        method: options.method || 'GET',
        headers: options.headers,
        data: options.body,
        timestamp: new Date().toISOString()
      });
      
      // Analyze the data format
      analyzeFormSubmission(urlString, options.method || 'GET', options.body);
      
      // Optionally block the actual request
      if (!CONFIG.ALLOW_REAL_REQUESTS && urlString.includes(CONFIG.TARGET_ENDPOINT)) {
        console.log('[Form Monitor] ⚠️ Blocked actual form submission (ALLOW_REAL_REQUESTS is disabled)');
        
        // Return a mock response
        return Promise.resolve(new Response(
          JSON.stringify({
            success: true,
            message: 'This is a mocked success response. No actual request was sent.',
            timestamp: new Date().toISOString(),
            note: 'Set ALLOW_REAL_REQUESTS to true to allow actual submissions'
          }), 
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' }
          }
        ));
      }
    }
    
    return originalFetch.apply(this, arguments);
  };
  
  return {
    getCapturedRequests: () => capturedRequests,
    restore: () => {
      XMLHttpRequest.prototype.open = originalXhrOpen;
      XMLHttpRequest.prototype.send = originalXhrSend;
      window.fetch = originalFetch;
      console.log('[Form Monitor] Restored original XHR and fetch methods');
    },
    getConfig: () => CONFIG,
    setConfig: (newConfig) => {
      Object.assign(CONFIG, newConfig);
      console.log('[Form Monitor] Configuration updated:', CONFIG);
    }
  };
}

/**
 * Analyze a form submission to verify it matches expected format
 */
function analyzeFormSubmission(url, method, data) {
  console.log('[Form Monitor] Analyzing form submission...');
  
  // Check if this is a form submission to the expected endpoint
  const isFormSubmission = url.includes('appointment') || url.includes('form/submit');
  if (!isFormSubmission) {
    console.log('[Form Monitor] Not a form submission. Skipping analysis.');
    return;
  }
  
  // Verify HTTP method
  const isPostMethod = method.toUpperCase() === 'POST';
  console.log('[Form Monitor] HTTP Method:', isPostMethod ? 'POST (correct)' : `${method} (incorrect)`);
  
  // Try to parse the data
  let formData;
  try {
    // Handle different data formats
    if (typeof data === 'string') {
      // Check if it's JSON
      if (data.trim().startsWith('{')) {
        formData = JSON.parse(data);
        console.log('[Form Monitor] Data format: JSON');
      }
      // Check if it's form-data with boundary
      else if (data.includes('boundary=')) {
        console.log('[Form Monitor] Data format: multipart/form-data');
        // We can't fully parse multipart form data here, but we can check for key elements
        const hasFormData = data.includes('name="formData"');
        const hasLocationId = data.includes('name="locationId"');
        const hasFormId = data.includes('name="formId"');
        
        console.log('[Form Monitor] Contains formData part:', hasFormData ? '✅ Yes' : '❌ No');
        console.log('[Form Monitor] Contains locationId part:', hasLocationId ? '✅ Yes' : '❌ No');
        console.log('[Form Monitor] Contains formId part:', hasFormId ? '✅ Yes' : '❌ No');
        
        return; // Exit early for multipart data
      }
    } else if (data instanceof FormData) {
      console.log('[Form Monitor] Data format: FormData object');
      // We can't directly access FormData contents for privacy reasons
      return; // Exit early for FormData
    } else if (typeof data === 'object') {
      formData = data;
      console.log('[Form Monitor] Data format: JavaScript object');
    }
  } catch (error) {
    console.log('[Form Monitor] Failed to parse data:', error);
    return;
  }
  
  // Verify required fields (if we have parsed formData)
  if (formData) {
    console.log('[Form Monitor] Checking required fields...');
    CONFIG.REQUIRED_FIELDS.forEach(field => {
      const hasField = formData[field] !== undefined;
      console.log(`Field "${field}": ${hasField ? '✅ Present' : '❌ MISSING'}`);
    });
  }
  
  // Verify target URL
  const expectedUrl = CONFIG.TARGET_ENDPOINT;
  const isCorrectUrl = url === expectedUrl;
  console.log('[Form Monitor] Target URL:', url);
  console.log('[Form Monitor] URL Correct:', isCorrectUrl ? '✅ Yes' : `❌ No (expected: ${expectedUrl})`);
  
  console.log('[Form Monitor] Analysis complete!');
  
  // Return the analysis result
  return {
    isCorrectUrl,
    isPostMethod,
    dataFormat: formData ? 'json' : data instanceof FormData ? 'formdata' : typeof data === 'string' && data.includes('boundary=') ? 'multipart' : 'unknown',
    hasRequiredFields: formData ? CONFIG.REQUIRED_FIELDS.every(field => formData[field] !== undefined) : null
  };
}

/**
 * Wait for form submit button click and monitor the submission
 */
function monitorFormSubmission(options = {}) {
  console.log('[Form Monitor] Starting form submission monitoring...');
  
  // Update config with any provided options
  if (options) {
    Object.assign(CONFIG, options);
  }
  
  // Show the current configuration
  console.log('[Form Monitor] Configuration:');
  console.log(`- Allow real requests: ${CONFIG.ALLOW_REAL_REQUESTS ? 'YES' : 'NO'}`);
  console.log(`- Target endpoint: ${CONFIG.TARGET_ENDPOINT}`);
  console.log(`- Verbose logging: ${CONFIG.VERBOSE_LOGGING ? 'YES' : 'NO'}`);
  
  // Set up interceptor
  const interceptor = setupXHRInterceptor();
  
  // Report stats
  const statsInterval = setInterval(() => {
    const requests = interceptor.getCapturedRequests();
    if (requests.length > 0) {
      console.log(`[Form Monitor] Captured ${requests.length} form-related requests so far.`);
    }
  }, 5000);
  
  // Enhance interceptor with stop function
  interceptor.stop = () => {
    clearInterval(statsInterval);
    interceptor.restore();
    console.log('[Form Monitor] Monitoring stopped');
  };
  
  return interceptor;
}

/**
 * Configure the form monitor
 */
function configureMonitor(options) {
  Object.assign(CONFIG, options);
  console.log('[Form Monitor] Configuration updated:');
  console.log(`- Allow real requests: ${CONFIG.ALLOW_REAL_REQUESTS ? 'YES' : 'NO'}`);
  console.log(`- Target endpoint: ${CONFIG.TARGET_ENDPOINT}`);
  console.log(`- Verbose logging: ${CONFIG.VERBOSE_LOGGING ? 'YES' : 'NO'}`);
  return CONFIG;
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.monitorFormSubmission = monitorFormSubmission;
  window.configureMonitor = configureMonitor;
  
  console.log('[Form Monitor] Form submission monitor loaded!');
  console.log('[Form Monitor] To start monitoring with default settings:');
  console.log('  const monitor = window.monitorFormSubmission()');
  console.log('[Form Monitor] To allow real requests (caution!):');
  console.log('  const monitor = window.monitorFormSubmission({ ALLOW_REAL_REQUESTS: true })');
  console.log('[Form Monitor] To stop monitoring:');
  console.log('  monitor.stop()');
}

// For Node.js environments
if (typeof module !== 'undefined') {
  module.exports = {
    setupXHRInterceptor,
    analyzeFormSubmission,
    monitorFormSubmission,
    configureMonitor,
    CONFIG
  };
} 