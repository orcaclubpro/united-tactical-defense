// test-form-submission.js
// Script to test the full appointment submission flow

const axios = require('axios');

// Test data for form submission
const testFormData = {
  firstName: 'Test',
  lastName: 'User',
  email: 'testuser@example.com',
  phone: '(555) 123-4567',
  appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  appointmentTime: '14:30', // 2:30 PM
  experience: 'beginner',
  source: 'test-script'
};

// Function to simulate the frontend submitFreeClassForm process
async function testSubmitForm() {
  console.log('Starting form submission test...');
  console.log('Test data:', testFormData);
  
  try {
    // Format the date and time for the API (same as in frontend)
    const formatDateWithTimezone = (date, timeString) => {
      // Parse hours and minutes from timeString
      let hours = 0;
      let minutes = 0;
      
      if (timeString.includes(':')) {
        const timeParts = timeString.split(':');
        hours = parseInt(timeParts[0], 10);
        minutes = parseInt(timeParts[1], 10);
      } else {
        hours = parseInt(timeString, 10) || 13;
      }
      
      // Create a new date with the specific time
      const dateTime = new Date(date);
      dateTime.setHours(hours, minutes, 0, 0);
      
      // Format for Pacific timezone
      const isoString = dateTime.toISOString();
      return isoString.replace(/\.\d+Z$/, '-07:00');
    };

    // Convert the form data to match the backend API structure
    const requestData = {
      first_name: testFormData.firstName,
      last_name: testFormData.lastName,
      email: testFormData.email,
      phone: testFormData.phone.replace(/\D/g, ''), // Remove non-digits
      sel_time: formatDateWithTimezone(testFormData.appointmentDate, testFormData.appointmentTime),
      duration: 90,
      source: testFormData.source,
      experience: testFormData.experience
    };

    console.log('Formatted request data:', requestData);
    console.log('Formatted date-time:', requestData.sel_time);

    // Test URL - modify as needed based on your development environment
    const apiUrl = 'http://localhost:3001/submit-appointment';
    
    console.log(`Sending request to: ${apiUrl}`);
    
    // Uncomment this to perform the actual API call
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('API response status:', response.status);
    console.log('API response data:', response.data);
    
    if (response.data.success) {
      console.log('\n✅ TEST PASSED: Form submitted successfully');
      console.log('Appointment details:', response.data.appointmentDetails);
    } else {
      console.log('\n❌ TEST FAILED: Form submission returned error');
      console.log('Error message:', response.data.message);
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED with error:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run the test
testSubmitForm();

/* 
   Instructions:
   
   1. Make sure your backend server is running:
      $ cd backend
      $ npm install
      $ node server.js
   
   2. Run this test script:
      $ node test-form-submission.js
   
   3. Check the output to verify the form submission process works
   
   Expected results:
   - The test should connect to your local backend server
   - The backend should process the request and return a success response
   - The console should show "TEST PASSED" if everything works
   
   Troubleshooting:
   - If connection refused: Make sure the backend server is running
   - If validation errors: Check the formatting of the test data
   - If server errors: Check the backend logs for details
*/