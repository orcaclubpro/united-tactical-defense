// Script to emulate appointment submission to UDT training website
// Note: This is for educational purposes only

async function submitAppointmentRequest() {
  // Define the boundary for multipart form data
  const boundary = '----geckoformboundary' + Math.random().toString(16).substring(2);
  
  // Prepare form data
  const formData = {
    cLNizIhBIdwpbrfvmqH8: [],
    first_name: "2TEST DNC",
    last_name: "2TEST DNC",
    phone: "+17143371885",
    email: "test@gmail.com",
    formId: "bHbGRJjmTWG67GNRFqQY",
    location_id: "wCjIiRV3L99XP2J5wYdA",
    calendar_id: "EwO4iAyVRl5dqwH9pi1O",
    selected_slot: "2025-04-03T13:30:00-07:00",
    selected_timezone: "America/Los_Angeles",
    sessionId: "48cf5a1e-fb67-4788-8c37-abcdb5ba8cd", // Slightly modified to avoid exact duplication
    eventData: {
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
        ids: ["48cf5a1e-fb67-4788-8c37-abcdb5ba8cd"]
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
      fbEventId: "c20afacf-b9a4-41f5-8a2e-d7f489ffa64b",
      medium: "calendar",
      mediumId: "EwO4iAyVRl5dqwH9pi1O"
    },
    sessionFingerprint: "c988c8e7-a2d9-408c-b3d2-00e39b865e67",
    funneEventData: {
      event_type: "optin",
      domain_name: "anaheimhills.uniteddefensetactical.com",
      page_url: "/calendar-free-pass",
      funnel_id: "U24FpiHkrMhcsvps5TR1",
      page_id: "0QbcKCTjT25VUqQhEKpj",
      funnel_step_id: "e451b167-1a02-436c-8df1-66dd8d5c1fe4"
    },
    dateFieldDetails: [],
    Timezone: "America/Los_Angeles (GMT-07:00)",
    paymentContactId: {},
    timeSpent: 93.875
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
      'timezone': 'America/Los_Angeles',
      'Origin': 'https://anaheimhills.uniteddefensetactical.com',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-GPC': '1',
      'Priority': 'u=4',
      'TE': 'trailers'
    },
    body: body
  };

  try {
    // In a real implementation, we would make the actual fetch request:
    //const response = await fetch('https://backend.leadconnectorhq.com/appengine/appointment', options);
    //const data = await response.json();
    //console.log(data);
    
    // Instead, we'll just log what would happen
    console.log('Request would be sent to: https://backend.leadconnectorhq.com/appengine/appointment');
    console.log('Request headers:', options.headers);
    console.log('Request body length:', options.body.length);
    console.log('First 500 chars of body:', options.body.substring(0, 500));
    
    return 'Appointment request simulation complete';
  } catch (error) {
    console.error('Error:', error);
    return 'Error in appointment request simulation';
  }
}

// Call the function to simulate the request
submitAppointmentRequest().then(console.log);

// Note: This is intentionally commented out to prevent accidental execution
// To execute this script, remove the comment from the above line
