/**
 * Script to handle appointment submission to Go High Level
 * Modified from the original book-appointment.js to work as a module
 */

/**
 * Submit an appointment request to Go High Level
 * @param {Object} customData - Object containing form fields to override defaults
 * @returns {Promise<Object>} - The response from the API or a simulation
 */
export async function submitAppointmentRequest(customData = {}) {
  // Define the boundary for multipart form data
  const boundary = '----geckoformboundary' + Math.random().toString(16).substring(2);
  
  // Generate a session ID if not provided
  const sessionId = customData.sessionId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Calculate time spent on page if not provided
  const timeSpent = customData.timeSpent || Math.floor(Math.random() * 150) + 50; // 50-200 seconds
  
  // Prepare form data with defaults that will be overridden by customData
  const formData = {
    cLNizIhBIdwpbrfvmqH8: [],
    first_name: customData.first_name || "Test",
    last_name: customData.last_name || "User",
    phone: customData.phone || "+17143371885",
    email: customData.email || "test@example.com",
    formId: customData.formId || "bHbGRJjmTWG67GNRFqQY",
    location_id: customData.location_id || "wCjIiRV3L99XP2J5wYdA",
    calendar_id: customData.calendar_id || "EwO4iAyVRl5dqwH9pi1O",
    selected_slot: customData.selected_slot || "2025-04-03T13:30:00-07:00",
    selected_timezone: customData.selected_timezone || "America/Los_Angeles",
    sessionId: sessionId,
    eventData: customData.eventData || {
      source: "direct",
      referrer: "https://app.gohighlevel.com/",
      keyword: "",
      adSource: "",
      url_params: {},
      page: {
        url: "https://anaheimhills.uniteddefensetactical.com/calendar-free-pass",
        title: "UDT Free Demo Training"
      },
      timestamp: Date.now(),
      campaign: "",
      contactSessionIds: {
        ids: [sessionId]
      },
      fbp: "",
      fbc: "",
      type: "page-visit",
      parentId: "0QbcKCTjT25VUqQhEKpj",
      pageVisitType: "funnel",
      domain: "anaheimhills.uniteddefensetactical.com",
      version: "v3",
      parentName: "",
      fingerprint: null,
      documentURL: "https://anaheimhills.uniteddefensetactical.com/calendar-free-pass",
      fbEventId: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      medium: "calendar",
      mediumId: "EwO4iAyVRl5dqwH9pi1O"
    },
    sessionFingerprint: customData.sessionFingerprint || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    funneEventData: customData.funneEventData || {
      event_type: "optin",
      domain_name: "anaheimhills.uniteddefensetactical.com",
      page_url: "/calendar-free-pass",
      funnel_id: "U24FpiHkrMhcsvps5TR1",
      page_id: "0QbcKCTjT25VUqQhEKpj",
      funnel_step_id: "e451b167-1a02-436c-8df1-66dd8d5c1fe4"
    },
    dateFieldDetails: customData.dateFieldDetails || [],
    Timezone: customData.Timezone || "America/Los_Angeles (GMT-07:00)",
    paymentContactId: customData.paymentContactId || {},
    timeSpent: timeSpent
  };

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
  
  // Add captchaV3 part (shortened for brevity - in a real scenario, would need a valid token)
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="captchaV3"\r\n\r\n';
  body += 'CAPTCHA_TOKEN_PLACEHOLDER\r\n';
  
  // Close the body
  body += `--${boundary}--\r\n`;
  
  // Define the request options
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:137.0) Gecko/20100101 Firefox/137.0',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Referer': 'https://anaheimhills.uniteddefensetactical.com/',
      'fullurl': 'https://anaheimhills.uniteddefensetactical.com/calendar-free-pass',
      'timezone': formData.selected_timezone,
      'Origin': 'https://anaheimhills.uniteddefensetactical.com',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site'
    },
    body: body
  };

  // Log the request details
  const logMessage = (msg) => {
    // Check if we're in a browser or Node environment
    if (typeof window !== 'undefined' && window.console) {
      window.console.log(msg);
    } else if (typeof console !== 'undefined') {
      console.log(msg);
    }
  };

  logMessage('\n============ GO HIGH LEVEL DIRECT REQUEST ============');
  logMessage('Request URL: https://backend.leadconnectorhq.com/appengine/appointment');
  logMessage('Request Headers: ' + JSON.stringify(options.headers, null, 2));
  logMessage('First 200 chars of body: ' + options.body.substring(0, 200) + '...');
  logMessage('Request Data: ' + JSON.stringify({
    first_name: formData.first_name,
    last_name: formData.last_name,
    email: formData.email,
    phone: formData.phone,
    selected_slot: formData.selected_slot,
    formId: formData.formId,
    location_id: formData.location_id,
    calendar_id: formData.calendar_id
  }, null, 2));

  try {
    // Determine which fetch to use (browser or node)
    const fetchFunc = typeof window !== 'undefined' && window.fetch 
      ? window.fetch 
      : typeof fetch !== 'undefined' 
        ? fetch 
        : null;
        
    // If fetch is not available, throw an error
    if (!fetchFunc) {
      throw new Error('Fetch is not available in this environment');
    }
    
    // Make the actual fetch request to Go High Level
    const response = await fetchFunc('https://backend.leadconnectorhq.com/appengine/appointment', options);
    
    // Log the response
    logMessage('\n============ GO HIGH LEVEL DIRECT RESPONSE ============');
    
    if (!response.ok) {
      const errorText = await response.text();
      const errorStatus = response.status;
      const errorMessage = `API responded with status: ${errorStatus}`;
      
      let rawServerResponse;
      try {
        // Try to parse the response as JSON, if possible
        rawServerResponse = JSON.parse(errorText);
      } catch (e) {
        // If it's not valid JSON, use the raw text
        rawServerResponse = errorText;
      }
      
      logMessage('Error response: ' + errorStatus + ' ' + errorText);
      
      // Return specific error messages based on status code
      let userFriendlyMessage = 'Failed to schedule appointment';
      
      if (errorStatus === 400) {
        userFriendlyMessage = 'Invalid appointment information provided. Please check your details and try again.';
      } else if (errorStatus === 401 || errorStatus === 403) {
        userFriendlyMessage = 'Authorization error. Please try again or contact support.';
      } else if (errorStatus === 404) {
        userFriendlyMessage = 'The appointment service is currently unavailable. Please try again later.';
      } else if (errorStatus === 409) {
        userFriendlyMessage = 'This time slot is no longer available. Please select another time.';
      } else if (errorStatus >= 500) {
        userFriendlyMessage = 'The appointment system is currently experiencing issues. Please try again later.';
      }
      
      return {
        success: false,
        error: errorMessage,
        message: userFriendlyMessage,
        statusCode: errorStatus,
        rawResponse: {
          status: errorStatus,
          text: errorText,
          parsed: rawServerResponse
        }
      };
    }
    
    const data = await response.json();
    logMessage('Response data: ' + JSON.stringify(data, null, 2));
    logMessage('============ END DIRECT RESPONSE ============\n');
    
    return {
      success: true,
      data: data,
      message: 'Appointment scheduled successfully',
      rawResponse: {
        status: response.status,
        data: data
      }
    };
  } catch (error) {
    const errorMessage = error.message || 'Unknown error';
    logMessage('\n============ GO HIGH LEVEL DIRECT ERROR ============');
    logMessage('Error: ' + errorMessage);
    logMessage('Error stack: ' + (error.stack || 'No stack trace available'));
    logMessage('============ END DIRECT ERROR ============\n');
    
    // Provide a more user-friendly error message based on the error type
    let userFriendlyMessage = 'Failed to schedule appointment. Please try again.';
    
    if (errorMessage.includes('network') || errorMessage.includes('connect')) {
      userFriendlyMessage = 'Network connection issue. Please check your internet connection and try again.';
    } else if (errorMessage.includes('timeout')) {
      userFriendlyMessage = 'Request timed out. The server may be busy, please try again later.';
    }
    
    return {
      success: false,
      error: errorMessage,
      message: userFriendlyMessage,
      rawResponse: {
        error: error,
        stack: error.stack,
        message: error.message
      }
    };
  }
}

// Create a named export object
const bookAppointmentService = {
  submitAppointmentRequest
};

// Export both as default and named exports for compatibility
export default bookAppointmentService;