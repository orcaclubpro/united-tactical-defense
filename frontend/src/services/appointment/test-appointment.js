/**
 * Test script for book-appointment.js
 * Run with: node src/services/appointment/test-appointment.js
 */

// Import the submitAppointmentRequest function
const { submitAppointmentRequest } = require('./book-appointment');

/**
 * Test function to verify book-appointment.js functionality
 */
async function testAppointmentRequest() {
  console.log('Starting test of submitAppointmentRequest function...');

  // Test data
  const testData = {
    first_name: "Test",
    last_name: "User",
    email: "test@example.com",
    phone: "+15555555555", // Using non-real phone number for test
    selected_slot: "2025-04-03T13:30:00-07:00", // Future date
  };

  console.log('Test data:', testData);
  console.log('Sending request to Go High Level...');

  try {
    // Call the appointment booking function
    const result = await submitAppointmentRequest(testData);
    
    // Log the result
    console.log('\n============ TEST RESULT ============');
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    
    if (result.data) {
      console.log('Response data:', JSON.stringify(result.data, null, 2));
    }
    
    if (result.error) {
      console.log('Error:', result.error);
    }
    
    console.log('============ END TEST RESULT ============\n');
    
    return result;
  } catch (error) {
    console.error('Unexpected error during test:', error);
    return {
      success: false,
      error: error.message,
      message: 'Test failed with unexpected error'
    };
  }
}

// Run the test
testAppointmentRequest()
  .then(() => console.log('Test completed.'))
  .catch(err => console.error('Test failed with error:', err)); 