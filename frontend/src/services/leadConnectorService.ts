/**
 * LeadConnector API Service
 * Handles appointment booking submissions to LeadConnector backend
 */

export interface LeadConnectorAppointmentData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  selectedSlot: string; // ISO format with timezone: YYYY-MM-DDTHH:mm:ss-07:00
  zipCode?: string;
  experience?: string;
  source?: string;
}

export interface LeadConnectorResponse {
  success: boolean;
  appointmentId?: string;
  message?: string;
  error?: string;
}

/**
 * Helper function to generate session ID
 */
const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Helper function to generate UUID
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

/**
 * Helper function to get captcha token placeholder
 */
const getCaptchaToken = async (): Promise<string> => {
  // In a real implementation, this would call the reCAPTCHA API
  // For this example, we'll just return a placeholder
  return 'CAPTCHA_TOKEN_PLACEHOLDER_' + generateSessionId();
};

/**
 * Submit appointment data to LeadConnector API
 */
export const submitToLeadConnector = async (
  appointmentData: LeadConnectorAppointmentData
): Promise<LeadConnectorResponse> => {
  try {
    const { firstName, lastName, email, phone, selectedSlot, source } = appointmentData;
    
    console.log('🔄 Submitting appointment to LeadConnector:', {
      firstName,
      lastName,
      email,
      phone: `+1${phone}`,
      selectedSlot
    });

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !selectedSlot) {
      throw new Error('Missing required fields for LeadConnector submission');
    }

    // Parse the selected time
    const selectedDate = new Date(selectedSlot);
    if (isNaN(selectedDate.getTime())) {
      throw new Error('Invalid date/time format for LeadConnector');
    }

    // Create the payload for the external API
    const boundary = '----geckoformboundary' + Math.random().toString(16).substring(2);
    const sessionId = generateSessionId();
    
    // Build the form data object matching the deprecated backend structure
    const formData = {
      cLNizIhBIdwpbrfvmqH8: [],
      first_name: firstName,
      last_name: lastName,
      phone: `+1${phone}`,
      email: email,
      formId: "bHbGRJjmTWG67GNRFqQY",
      location_id: "wCjIiRV3L99XP2J5wYdA",
      calendar_id: "EwO4iAyVRl5dqwH9pi1O",
      selected_slot: selectedSlot,
      selected_timezone: "America/Los_Angeles",
      sessionId: sessionId,
      eventData: {
        source: source || "website",
        referrer: window.location.href,
        keyword: "",
        adSource: "",
        url_params: {},
        page: {
          url: window.location.href,
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
        domain: "uniteddefensetactical.com",
        version: "v3",
        parentName: "",
        fingerprint: null,
        documentURL: window.location.href,
        fbEventId: generateUUID(),
        medium: "calendar",
        mediumId: "EwO4iAyVRl5dqwH9pi1O"
      },
      sessionFingerprint: generateUUID(),
      funneEventData: {
        event_type: "optin",
        domain_name: "uniteddefensetactical.com",
        page_url: "/calendar-free-pass",
        funnel_id: "U24FpiHkrMhcsvps5TR1",
        page_id: "0QbcKCTjT25VUqQhEKpj",
        funnel_step_id: "e451b167-1a02-436c-8df1-66dd8d5c1fe4"
      },
      dateFieldDetails: [],
      Timezone: "America/Los_Angeles (GMT-07:00)",
      paymentContactId: {},
      timeSpent: Math.floor(Math.random() * 100) + 50
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
    body += 'wCjIiRV3L99XP2J5wYdA\r\n';
    
    // Add formId part
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="formId"\r\n\r\n';
    body += 'bHbGRJjmTWG67GNRFqQY\r\n';
    
    // Add captchaV3 part
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="captchaV3"\r\n\r\n';
    body += await getCaptchaToken() + '\r\n';
    
    // Close the body
    body += `--${boundary}--\r\n`;

    // Define request options for external API
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'User-Agent': 'Mozilla/5.0 (compatible)',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Referer': window.location.href,
        'fullurl': window.location.href,
        'timezone': 'America/Los_Angeles',
        'Origin': 'https://uniteddefensetactical.com',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Priority': 'u=4'
      },
      body: body
    };

    // Make the API request to LeadConnector
    console.log('🔄 Sending request to LeadConnector API...');
    const response = await fetch('https://backend.leadconnectorhq.com/appengine/appointment', options);
    
    if (!response.ok) {
      console.error('❌ LeadConnector API error:', response.status, response.statusText);
      throw new Error(`LeadConnector API error: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log('✅ LeadConnector API response successful:', responseData);
    
    // Return success response
    return {
      success: true,
      appointmentId: responseData.id || generateUUID(),
      message: 'Appointment scheduled successfully with LeadConnector'
    };

  } catch (error) {
    console.error('❌ LeadConnector submission error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred with LeadConnector',
      message: 'Failed to schedule appointment with LeadConnector'
    };
  }
};

const leadConnectorService = {
  submitToLeadConnector
};

export default leadConnectorService;