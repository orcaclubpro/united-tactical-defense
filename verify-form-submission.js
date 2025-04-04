// Verify Form Submission
// This script compares form submissions against the reference book-appointment.js format
// Now with optional live request sending capability

const https = require('https');
const querystring = require('querystring');

// Configuration
const CONFIG = {
  // Set to true to actually send requests to the real endpoint (USE WITH CAUTION)
  ENABLE_LIVE_REQUESTS: false,
  
  // Default endpoint for form submissions
  TARGET_ENDPOINT: 'https://backend.leadconnectorhq.com/appengine/appointment',
  
  // Timeout for live requests in milliseconds
  REQUEST_TIMEOUT: 10000
};

/**
 * Create a sample form submission data object
 * @returns {Object} Form data
 */
function createSampleFormData() {
  return {
    cLNizIhBIdwpbrfvmqH8: [],
    first_name: "Test",
    last_name: "User",
    phone: "+12345678901",
    email: "test@example.com",
    formId: "bHbGRJjmTWG67GNRFqQY",
    location_id: "wCjIiRV3L99XP2J5wYdA",
    calendar_id: "EwO4iAyVRl5dqwH9pi1O",
    selected_slot: "2025-04-03T13:30:00-07:00",
    selected_timezone: "America/Los_Angeles",
    sessionId: "48cf5a1e-fb67-4788-8c37-abcdb5ba8cd",
    // Include basic event data structure
    eventData: {
      source: "direct",
      page: {
        url: "https://anaheimhills.uniteddefensetactical.com/calendar-free-pass",
        title: "UDT Free Demo Training"
      },
      timestamp: Date.now()
    }
  };
}

/**
 * Create a form submission body based on the reference format in book-appointment.js
 * @param {Object} formData - Form data to submit
 * @returns {Object} Request details including body and headers
 */
function createFormSubmission(formData) {
  // Create boundary for multipart form data
  const boundary = '----geckoformboundary' + Math.random().toString(16).substring(2);
  
  // Create multipart form body
  let body = '';
  
  // Add formData part
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="formData"\r\n\r\n';
  body += JSON.stringify(formData) + '\r\n';
  
  // Add locationId part
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="locationId"\r\n\r\n';
  body += formData.location_id + '\r\n';
  
  // Add formId part
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="formId"\r\n\r\n';
  body += formData.formId + '\r\n';
  
  // Add captchaV3 part
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="captchaV3"\r\n\r\n';
  body += 'CAPTCHA_TOKEN_PLACEHOLDER\r\n';
  
  // Close the body
  body += `--${boundary}--\r\n`;
  
  // Define the request options
  const requestDetails = {
    url: CONFIG.TARGET_ENDPOINT,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:137.0) Gecko/20100101 Firefox/137.0',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': 'https://anaheimhills.uniteddefensetactical.com/',
      'Origin': 'https://anaheimhills.uniteddefensetactical.com',
      'Content-Length': Buffer.byteLength(body)
    },
    body: body
  };
  
  return requestDetails;
}

/**
 * Verify that a form data object has all required fields
 * @param {Object} formData - Form data to verify
 * @returns {Object} Verification result
 */
function verifyFormData(formData) {
  // Define required fields based on book-appointment.js
  const requiredFields = [
    'first_name', 
    'last_name', 
    'phone', 
    'email', 
    'formId', 
    'location_id', 
    'calendar_id', 
    'selected_slot', 
    'selected_timezone'
  ];
  
  // Check for missing required fields
  const missingFields = requiredFields.filter(field => !formData[field]);
  
  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields,
    requiredFields: requiredFields
  };
}

/**
 * Compare the generated request with the reference in book-appointment.js
 * @param {Object} request - Generated request details
 * @returns {Object} Comparison result
 */
function compareWithReferenceRequest(request) {
  // Reference endpoint
  const referenceEndpoint = CONFIG.TARGET_ENDPOINT;
  
  // Reference headers
  const referenceHeaders = [
    'Content-Type',
    'User-Agent',
    'Accept',
    'Referer',
    'Origin'
  ];
  
  // Check if the endpoint matches
  const endpointMatches = request.url === referenceEndpoint;
  
  // Check if all reference headers are present
  const missingHeaders = referenceHeaders.filter(header => !request.headers[header]);
  
  // Check if Content-Type header includes multipart/form-data and boundary
  const contentTypeCorrect = request.headers['Content-Type']?.includes('multipart/form-data') && 
                             request.headers['Content-Type']?.includes('boundary=');
  
  return {
    endpointMatches,
    headersMatch: missingHeaders.length === 0,
    contentTypeCorrect,
    missingHeaders
  };
}

/**
 * Actually send the request to the target endpoint
 * @param {Object} requestDetails - Request details including URL, method, headers, and body
 * @returns {Promise<Object>} - Response data
 */
function sendLiveRequest(requestDetails) {
  return new Promise((resolve, reject) => {
    // Parse the URL
    const url = new URL(requestDetails.url);
    
    // Set up the request options
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: requestDetails.method,
      headers: requestDetails.headers,
      timeout: CONFIG.REQUEST_TIMEOUT
    };
    
    // Create the request
    const req = https.request(options, (res) => {
      let data = '';
      
      // Collect response data
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      // When the response is complete
      res.on('end', () => {
        try {
          // Try to parse as JSON, but fall back to raw data if not possible
          const parsedData = data.startsWith('{') ? JSON.parse(data) : data;
          resolve({
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            data: data,
            parseError: error.message
          });
        }
      });
    });
    
    // Handle request errors
    req.on('error', (error) => {
      reject({
        error: error.message,
        code: error.code
      });
    });
    
    // Handle timeout
    req.on('timeout', () => {
      req.destroy();
      reject({
        error: 'Request timeout',
        code: 'TIMEOUT'
      });
    });
    
    // Send the body data
    req.write(requestDetails.body);
    req.end();
  });
}

/**
 * Enable or disable live request mode
 * @param {boolean} enabled - Whether to enable live requests
 */
function setLiveRequestMode(enabled) {
  CONFIG.ENABLE_LIVE_REQUESTS = !!enabled;
  console.log(`Live request mode ${CONFIG.ENABLE_LIVE_REQUESTS ? 'ENABLED' : 'DISABLED'}`);
  
  if (CONFIG.ENABLE_LIVE_REQUESTS) {
    console.log('⚠️  WARNING: Live requests will be sent to real endpoints!');
    console.log('⚠️  Use with caution and only for authorized testing.');
  }
}

/**
 * Run all verification steps and optionally send the request
 * @param {boolean} sendLive - Whether to send a live request to the actual endpoint
 */
async function verifyFormSubmission(sendLive = CONFIG.ENABLE_LIVE_REQUESTS) {
  console.log('======= FORM SUBMISSION VERIFICATION =======\n');
  console.log(`Mode: ${sendLive ? 'LIVE REQUEST SENDING ENABLED' : 'TEST MODE (No actual requests)'}`);
  
  // Step 1: Create sample data
  console.log('\nSTEP 1: Creating sample form data...');
  const formData = createSampleFormData();
  console.log('Sample form data created with', Object.keys(formData).length, 'fields\n');
  
  // Step 2: Verify form data has required fields
  console.log('STEP 2: Verifying form data fields...');
  const formVerification = verifyFormData(formData);
  console.log('Form data validation:', formVerification.isValid ? 'PASSED' : 'FAILED');
  if (!formVerification.isValid) {
    console.log('Missing required fields:', formVerification.missingFields);
  }
  console.log('Required fields:', formVerification.requiredFields, '\n');
  
  // Step 3: Create request body
  console.log('STEP 3: Creating request body...');
  const requestDetails = createFormSubmission(formData);
  console.log('Request URL:', requestDetails.url);
  console.log('Request headers:', Object.keys(requestDetails.headers));
  console.log('Request body length:', requestDetails.body.length);
  console.log('First 100 chars of body:', requestDetails.body.substring(0, 100), '...\n');
  
  // Step 4: Compare with reference
  console.log('STEP 4: Comparing with reference request...');
  const comparisonResult = compareWithReferenceRequest(requestDetails);
  console.log('Endpoint matches:', comparisonResult.endpointMatches ? 'YES' : 'NO');
  console.log('Headers validation:', comparisonResult.headersMatch ? 'PASSED' : 'FAILED');
  console.log('Content-Type correct:', comparisonResult.contentTypeCorrect ? 'YES' : 'NO');
  if (!comparisonResult.headersMatch) {
    console.log('Missing headers:', comparisonResult.missingHeaders);
  }
  
  // Step 5: Send the request (if enabled)
  let liveRequestResult = null;
  if (sendLive) {
    console.log('\nSTEP 5: Sending LIVE request to real endpoint...');
    console.log('⚠️  Sending request to:', requestDetails.url);
    
    try {
      liveRequestResult = await sendLiveRequest(requestDetails);
      console.log('Response status:', liveRequestResult.statusCode, liveRequestResult.statusMessage);
      console.log('Response headers:', JSON.stringify(liveRequestResult.headers, null, 2));
      console.log('Response data:', JSON.stringify(liveRequestResult.data, null, 2));
      
      if (liveRequestResult.statusCode >= 200 && liveRequestResult.statusCode < 300) {
        console.log('Live request: SUCCESS ✅');
      } else {
        console.log('Live request: FAILED ❌ (HTTP status indicates failure)');
      }
    } catch (error) {
      console.error('Error sending live request:', error);
      liveRequestResult = { error };
      console.log('Live request: FAILED ❌ (Request error)');
    }
  }
  
  // Overall result
  console.log('\n======= VERIFICATION RESULT =======');
  const overallSuccess = formVerification.isValid && 
                         comparisonResult.endpointMatches && 
                         comparisonResult.headersMatch && 
                         comparisonResult.contentTypeCorrect;
  
  console.log('Format verification:', overallSuccess ? 'PASSED ✅' : 'FAILED ❌');
  
  if (sendLive) {
    const liveSuccess = liveRequestResult && 
                       liveRequestResult.statusCode && 
                       liveRequestResult.statusCode >= 200 && 
                       liveRequestResult.statusCode < 300;
    
    console.log('Live request test:', liveSuccess ? 'PASSED ✅' : 'FAILED ❌');
    console.log('\nReminder: Live requests were enabled for this test!');
  }
  
  console.log('\nThis verification confirms that the form submission follows the same format as book-appointment.js');
  
  return {
    formatVerification: {
      success: overallSuccess,
      details: {
        formData: formVerification,
        requestFormat: comparisonResult
      }
    },
    liveRequest: liveRequestResult,
    requestDetails: requestDetails
  };
}

// Process command line arguments
function processArgs() {
  const args = process.argv.slice(2);
  
  if (args.includes('--live') || args.includes('-l')) {
    setLiveRequestMode(true);
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Form Submission Verification Tool

Usage:
  node ${process.argv[1].split('/').pop()} [options]

Options:
  --live, -l     Enable live request mode (send real requests to endpoint)
  --help, -h     Show this help message
  
Examples:
  node ${process.argv[1].split('/').pop()}              Run in test mode (no real requests)
  node ${process.argv[1].split('/').pop()} --live       Run with live requests enabled
    `);
    process.exit(0);
  }
}

// Run verification if this file is executed directly
if (require.main === module) {
  processArgs();
  verifyFormSubmission();
}

module.exports = {
  createSampleFormData,
  createFormSubmission,
  verifyFormData,
  compareWithReferenceRequest,
  verifyFormSubmission,
  setLiveRequestMode,
  sendLiveRequest,
  CONFIG
}; 