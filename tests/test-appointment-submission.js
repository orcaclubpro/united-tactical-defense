/**
 * Test Appointment Submission System
 * Tests the integration of the external appointment form submission system.
 */

const axios = require('axios');

// Define the same form data structure as in the GHL system
const formData = {
  cLNizIhBIdwpbrfvmqH8: [],
  first_name: "TEST",
  last_name: "APPOINTMENT",
  phone: "+17143371234",
  email: "test@example.com",
  formId: "bHbGRJjmTWG67GNRFqQY",
  location_id: "wCjIiRV3L99XP2J5wYdA",
  calendar_id: "EwO4iAyVRl5dqwH9pi1O",
  selected_slot: new Date(Date.now() + 86400000).toISOString(), // tomorrow
  selected_timezone: "America/Los_Angeles",
  sessionId: "48cf5a1e-fb67-4788-8c37-abcdb5ba8ab", 
  eventData: {
    source: "test",
    referrer: "test script",
    keyword: "",
    adSource: "",
    url_params: {},
    page: {
      url: "https://anaheimhills.uniteddefensetactical.com/calendar-free-pass",
      title: "UDT Free Demo Training"
    },
    timestamp: Date.now(),
    campaign: "test",
    contactSessionIds: {
      ids: ["48cf5a1e-fb67-4788-8c37-abcdb5ba8ab"]
    },
    type: "test",
    domain: "anaheimhills.uniteddefensetactical.com",
    version: "test",
    medium: "test"
  },
  sessionFingerprint: "c988c8e7-a2d9-408c-b3d2-00e39b865e67",
  funneEventData: {
    event_type: "test",
    domain_name: "anaheimhills.uniteddefensetactical.com",
    page_url: "/calendar-free-pass",
    funnel_id: "test",
    page_id: "test",
    funnel_step_id: "test"
  },
  dateFieldDetails: [],
  Timezone: "America/Los_Angeles (GMT-07:00)",
  paymentContactId: {},
  timeSpent: 5
};

async function testAppointmentSubmission() {
  try {
    console.log('Testing appointment submission...');
    
    // Get the server URL from environment or default to localhost
    const API_URL = process.env.API_URL || 'http://localhost:3000';
    const endpoint = `${API_URL}/api/forms/external/appointment/goHighLevelAdapter`;
    
    console.log(`Submitting to endpoint: ${endpoint}`);
    console.log('Form data:', JSON.stringify(formData, null, 2));
    
    // Submit the form
    const response = await axios.post(endpoint, formData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TestScript',
        'Origin': 'http://localhost:3000',
        'Referer': 'http://localhost:3000'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // If successful, fetch the form submission
    if (response.data.success && response.data.formId) {
      console.log(`\nFetching form submission with ID: ${response.data.formId}`);
      
      try {
        // Note: This requires authentication, so it might not work in the test script
        // You would need to authenticate first and include the JWT token
        const formResponse = await axios.get(`${API_URL}/api/forms/submissions/${response.data.formId}`);
        console.log('Form submission data:', JSON.stringify(formResponse.data, null, 2));
      } catch (error) {
        console.log('Error fetching form submission (might require authentication):', error.message);
      }
    }
    
    return 'Test completed successfully';
  } catch (error) {
    console.error('Error in test script:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return 'Test failed';
  }
}

// Run the test
console.log('Starting appointment submission test');
testAppointmentSubmission()
  .then(result => console.log('\nResult:', result))
  .catch(error => console.error('\nUnexpected error:', error)); 