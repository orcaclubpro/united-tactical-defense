/**
 * Authentication API Test Script
 * Tests the authentication endpoints of the API
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3004';
const TEST_USER = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'TestPass123!'
};

let accessToken = null;
let refreshToken = null;

/**
 * Test the user registration endpoint
 */
const testRegistration = async () => {
  try {
    console.log('\n--- Testing Registration ---');
    const response = await axios.post(`${API_URL}/api/auth/register`, TEST_USER);
    
    console.log(`Status: ${response.status}`);
    console.log('User Data:', response.data.user);
    console.log('Access Token:', response.data.token ? 'Received' : 'Missing');
    console.log('Refresh Token:', response.data.refreshToken ? 'Received' : 'Missing');
    
    accessToken = response.data.token;
    refreshToken = response.data.refreshToken;
    
    return true;
  } catch (error) {
    console.error('Registration failed:', error.response ? error.response.data : error.message);
    
    // If user already exists, return true to continue tests
    if (error.response && error.response.data && error.response.data.message === 'User with this email already exists') {
      console.log('User already exists, continuing with login test...');
      return true;
    }
    
    return false;
  }
};

/**
 * Test the user login endpoint
 */
const testLogin = async () => {
  try {
    console.log('\n--- Testing Login ---');
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    console.log(`Status: ${response.status}`);
    console.log('User Data:', response.data.user);
    console.log('Access Token:', response.data.token ? 'Received' : 'Missing');
    console.log('Refresh Token:', response.data.refreshToken ? 'Received' : 'Missing');
    
    accessToken = response.data.token;
    refreshToken = response.data.refreshToken;
    
    return true;
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    return false;
  }
};

/**
 * Test the get current user endpoint
 */
const testGetUser = async () => {
  try {
    console.log('\n--- Testing Get Current User ---');
    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log('User Data:', response.data.user);
    
    return true;
  } catch (error) {
    console.error('Get User failed:', error.response ? error.response.data : error.message);
    return false;
  }
};

/**
 * Test the refresh token endpoint
 */
const testTokenRefresh = async () => {
  try {
    console.log('\n--- Testing Token Refresh ---');
    const response = await axios.post(`${API_URL}/api/auth/refresh`, {
      refreshToken
    });
    
    console.log(`Status: ${response.status}`);
    console.log('User Data:', response.data.user);
    console.log('New Access Token:', response.data.token ? 'Received' : 'Missing');
    
    // Update access token
    accessToken = response.data.token;
    
    return true;
  } catch (error) {
    console.error('Token Refresh failed:', error.response ? error.response.data : error.message);
    return false;
  }
};

/**
 * Run all tests
 */
const runTests = async () => {
  console.log('Starting Authentication API Tests\n');
  
  // Test user registration
  if (await testRegistration()) {
    // Test user login
    if (await testLogin()) {
      // Test get current user
      await testGetUser();
      
      // Test token refresh
      await testTokenRefresh();
      
      // Test get current user with refreshed token
      await testGetUser();
    }
  }
  
  console.log('\nTests completed');
};

// Run the tests
runTests().catch(console.error); 