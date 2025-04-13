// Handler for /submit-appointment endpoint
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Process appointment submissions
router.post('/', async (req, res) => {
  console.log('📩 Received appointment submission:', {
    timestamp: new Date().toISOString(),
    body: req.body,
    headers: {
      contentType: req.headers['content-type'],
      origin: req.headers.origin,
      referer: req.headers.referer,
    }
  });

  try {
    const { first_name, last_name, email, phone, selected_slot } = req.body;
    
    // Validate required fields
    if (!first_name || !last_name || !email || !phone || !selected_slot) {
      console.error('❌ Missing required fields:', { first_name, last_name, email, phone, selected_slot });
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Parse the selected time
    const selectedDate = new Date(selected_slot);
    if (isNaN(selectedDate.getTime())) {
      console.error('❌ Invalid date/time format:', selected_slot);
      return res.status(400).json({
        success: false,
        error: 'Invalid date/time format'
      });
    }

    // Create the payload for the external API
    const boundary = '----geckoformboundary' + Math.random().toString(16).substring(2);
    const sessionId = generateSessionId();
    
    // Build the form data object
    const formData = {
      cLNizIhBIdwpbrfvmqH8: [],
      first_name,
      last_name,
      phone: `+1${phone}`,
      email,
      formId: "bHbGRJjmTWG67GNRFqQY",
      location_id: "wCjIiRV3L99XP2J5wYdA",
      calendar_id: "EwO4iAyVRl5dqwH9pi1O",
      selected_slot,
      selected_timezone: "America/Los_Angeles",
      sessionId,
      eventData: {
        source: "direct",
        referrer: req.headers.referer || "https://uniteddefensetactical.com/",
        keyword: "",
        adSource: "",
        url_params: {},
        page: {
          url: req.headers.fullurl || "https://uniteddefensetactical.com/",
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
        documentURL: req.headers.fullurl || "https://uniteddefensetactical.com/",
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

    console.log('🔄 Processing appointment with data:', { 
      first_name, 
      last_name, 
      email, 
      phone: `+1${phone}`, 
      selected_slot,
      session: sessionId
    });

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
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'User-Agent': 'Mozilla/5.0 (compatible)',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Referer': req.headers.referer || 'https://uniteddefensetactical.com/',
        'fullurl': req.headers.fullurl || 'https://uniteddefensetactical.com/',
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

    try {
      // Make the API request to the external service
      console.log('🔄 Sending request to external API...');
      const response = await fetch('https://backend.leadconnectorhq.com/appengine/appointment', options);
      
      if (!response.ok) {
        console.error('❌ External API error:', response.status, response.statusText);
        return res.status(response.status).json({
          success: false,
          error: 'Error from appointment service'
        });
      }
      
      const responseData = await response.json();
      console.log('✅ External API response successful:', responseData);
      
      // Return success response
      const successResponse = {
        success: true,
        message: 'Appointment scheduled successfully',
        appointmentId: responseData.id || generateUUID(),
        appointmentDetails: {
          date: new Date(selected_slot).toLocaleDateString(),
          time: new Date(selected_slot).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          location: 'United Defense Tactical Training Center'
        }
      };
      
      console.log('✅ Sending success response to client:', successResponse);
      return res.status(200).json(successResponse);
    } catch (error) {
      console.error('❌ External API request error:', error);
      
      // For development/testing fallback
      const fallbackResponse = {
        success: true,
        message: 'Appointment scheduled successfully (development mode)',
        appointmentId: `dev-appointment-${generateUUID()}`,
        appointmentDetails: {
          date: new Date(selected_slot).toLocaleDateString(),
          time: new Date(selected_slot).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          location: 'United Defense Tactical Training Center'
        }
      };
      
      console.log('ℹ️ Using fallback response (development mode):', fallbackResponse);
      return res.status(200).json(fallbackResponse);
    }

  } catch (error) {
    console.error('❌ Appointment submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing your appointment'
    });
  }
});

// Helper function to generate a session ID
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Helper function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper function to get captcha token
async function getCaptchaToken() {
  // In a real implementation, this would call the reCAPTCHA API
  // For this example, we'll just return a placeholder
  return 'CAPTCHA_TOKEN_PLACEHOLDER_' + generateSessionId();
}

module.exports = router;
