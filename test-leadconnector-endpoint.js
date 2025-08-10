// test-leadconnector-endpoint.js
// Script to test the LeadConnector form submission endpoint directly

const fetch = require('node-fetch');

// Helper functions (matching the current frontend implementation)
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

function getCaptchaToken() {
  return 'CAPTCHA_TOKEN_PLACEHOLDER_' + generateSessionId();
}

// Test data - using a more realistic near-future date
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(14, 30, 0, 0); // 2:30 PM
const selectedSlotISO = tomorrow.toISOString().replace('Z', '-07:00');

const testData = {
  firstName: 'Test',
  lastName: 'User', 
  email: 'testuser@example.com',
  phone: '5551234567',
  selectedSlot: selectedSlotISO // Tomorrow at 2:30 PM PT
};

async function testLeadConnectorEndpoint() {
  console.log('🧪 Testing LeadConnector endpoint...');
  console.log('Test data:', testData);
  
  try {
    const { firstName, lastName, email, phone, selectedSlot } = testData;
    
    // Create the payload matching the fixed implementation
    const boundary = '----geckoformboundary' + Math.random().toString(16).substring(2);
    const sessionId = generateSessionId();
    const currentUrl = 'https://uniteddefensetactical.com/booking';
    
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
      session_duration: 90,
      sessionId: sessionId,
      eventData: {
        source: "website",
        referrer: currentUrl,
        keyword: "",
        adSource: "",
        url_params: {},
        page: {
          url: currentUrl,
          title: "UDT Free Demo Training"
        },
        timestamp: Date.now(),
        campaign: "",
        contactSessionIds: {
          ids: [sessionId]
        },
        fbp: "",
        fbc: "",
        type: "appointment",
        parentId: "0QbcKCTjT25VUqQhEKpj",
        pageVisitType: "funnel",
        domain: "uniteddefensetactical.com",
        version: "v3",
        parentName: "",
        fingerprint: null,
        documentURL: currentUrl,
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

    console.log('📦 Form data structure created');

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
    body += getCaptchaToken() + '\r\n';
    
    // Close the body
    body += `--${boundary}--\r\n`;

    console.log('📨 Multipart body created, size:', body.length, 'bytes');

    // Make the request to LeadConnector
    console.log('🚀 Sending request to LeadConnector...');
    
    const response = await fetch('https://backend.leadconnectorhq.com/appengine/appointment', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'User-Agent': 'Mozilla/5.0 (compatible)',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Referer': currentUrl,
        'Origin': 'https://uniteddefensetactical.com',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Priority': 'u=4'
      },
      body: body
    });

    console.log('📡 Response received');
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers));

    let responseData;
    try {
      responseData = await response.json();
      console.log('Response data:', responseData);
    } catch (parseError) {
      const textResponse = await response.text();
      console.log('Response (text):', textResponse);
    }

    if (response.ok) {
      console.log('✅ SUCCESS: LeadConnector endpoint is working!');
      console.log('The form submission was accepted');
    } else {
      console.log('❌ FAILED: LeadConnector endpoint rejected the request');
      console.log('Error status:', response.status);
      
      if (response.status === 401) {
        console.log('💡 This is likely an authentication/authorization issue');
        console.log('The endpoint may require API keys or proper authentication');
      } else if (response.status === 400) {
        console.log('💡 This is likely a validation error in the form data');
        console.log('Check the payload structure against API expectations');
      }
    }

  } catch (error) {
    console.error('❌ TEST FAILED with network error:');
    console.error('Error:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 DNS resolution failed - check internet connection');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Connection refused - endpoint may be down');
    }
  }
}

// Run the test
console.log('🧪 Starting LeadConnector Endpoint Test');
console.log('='.repeat(50));
testLeadConnectorEndpoint()
  .then(() => {
    console.log('='.repeat(50));
    console.log('🏁 Test completed');
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
  });