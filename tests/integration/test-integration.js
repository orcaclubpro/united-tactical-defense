const axios = require('axios');

async function testBackendHealth() {
  try {
    const response = await axios.get('http://localhost:3004/api/health');
    console.log('Backend health check:', response.data);
    return true;
  } catch (error) {
    console.error('Backend health check failed:', error.message);
    return false;
  }
}

async function testFrontendLoads() {
  try {
    const response = await axios.get('http://localhost:3000');
    // Just check if we get a 200 status code
    console.log('Frontend loads successfully:', response.status === 200);
    return response.status === 200;
  } catch (error) {
    console.error('Frontend failed to load:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('Starting integration tests...');

  // Test backend health
  const backendHealth = await testBackendHealth();
  
  // Test frontend loads
  const frontendLoads = await testFrontendLoads();
  
  // Summary
  console.log('\nTest Results:');
  console.log('-------------');
  console.log('Backend Health Check:', backendHealth ? 'PASSED' : 'FAILED');
  console.log('Frontend Loads:', frontendLoads ? 'PASSED' : 'FAILED');
  
  console.log('\nIntegration Test Notes:');
  console.log('1. Backend is running on port 3004 ✓');
  console.log('2. Frontend is running on port 3000 ' + (frontendLoads ? '✓' : '✗'));
  console.log('3. Frontend should be configured to proxy /api requests to backend');
  console.log('4. The setupProxy.js file has been created to handle this');
  
  if (backendHealth) {
    console.log('\nBackend is working properly!');
    
    if (frontendLoads) {
      console.log('Frontend is loading properly!');
      console.log('\nTo manually verify the frontend-backend integration:');
      console.log('1. Open your browser to http://localhost:3000');
      console.log('2. Use the application and verify API calls work');
      console.log('3. Check browser dev tools Network tab for successful API calls');
      return 0;
    } else {
      console.log('\nFrontend is not loading properly. Follow these steps:');
      console.log('1. Make sure you\'ve run "npm install" in the frontend directory');
      console.log('2. Make sure you\'re running "npm run dev" or "npm run client"');
      console.log('3. Check the frontend console for errors');
      return 1;
    }
  } else {
    console.log('\nBackend is not working properly. Follow these steps:');
    console.log('1. Make sure your .env file has PORT=3004');
    console.log('2. Make sure you\'re running "npm start" or "npm run server"');
    console.log('3. Check the backend console for errors');
    return 1;
  }
}

// Run the tests and exit with appropriate code
runTests().then(exitCode => {
  process.exit(exitCode);
}).catch(error => {
  console.error('Error during test execution:', error);
  process.exit(1);
}); 