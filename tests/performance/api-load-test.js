const autocannon = require('autocannon');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

// Convert autocannon to promise-based
const autocannonAsync = promisify(autocannon);

// Function to write results to file
const writeResults = (results, name) => {
  const resultsPath = path.join(__dirname, '../data/performance');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(resultsPath)) {
    fs.mkdirSync(resultsPath, { recursive: true });
  }
  
  const filePath = path.join(resultsPath, `${name}-${new Date().toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  console.log(`Results written to ${filePath}`);
};

// Base test configuration
const baseConfig = {
  url: 'http://localhost:3000',
  connections: 10, // number of concurrent connections
  duration: 10,    // duration of the test in seconds
  headers: {
    'Content-Type': 'application/json'
  }
};

// Test get available appointment times
const testAvailableTimes = async () => {
  console.log('Testing GET /api/appointments/available endpoint...');
  
  const config = {
    ...baseConfig,
    title: 'Get Available Times',
    requests: [
      {
        method: 'GET',
        path: '/api/appointments/available?date=2023-06-15'
      }
    ]
  };
  
  const results = await autocannonAsync(config);
  console.log(`
Available Times Test Results:
  Requests: ${results.requests.total}
  Throughput: ${results.requests.average} req/sec
  Latency Avg: ${results.latency.average} ms
  Latency Max: ${results.latency.max} ms
  Errors: ${results.errors}
  `);
  
  writeResults(results, 'available-times');
  return results;
};

// Test form submission
const testFormSubmission = async () => {
  console.log('Testing POST /api/forms/submit endpoint...');
  
  const config = {
    ...baseConfig,
    title: 'Form Submission',
    requests: [
      {
        method: 'POST',
        path: '/api/forms/submit',
        body: JSON.stringify({
          formType: 'contact',
          formData: {
            name: 'Performance Test',
            email: 'performance@test.com',
            phone: '123-456-7890',
            message: 'This is a performance test'
          }
        })
      }
    ]
  };
  
  const results = await autocannonAsync(config);
  console.log(`
Form Submission Test Results:
  Requests: ${results.requests.total}
  Throughput: ${results.requests.average} req/sec
  Latency Avg: ${results.latency.average} ms
  Latency Max: ${results.latency.max} ms
  Errors: ${results.errors}
  `);
  
  writeResults(results, 'form-submission');
  return results;
};

// Test lesson request
const testLessonRequest = async () => {
  console.log('Testing POST /api/appointments/lesson-request endpoint...');
  
  // Array of test data to avoid rate limiting
  const testData = Array(100).fill().map((_, i) => ({
    name: `Test User ${i}`,
    email: `test${i}@example.com`,
    phone: `123-456-${i.toString().padStart(4, '0')}`,
    date: '2023-06-15',
    startTime: '09:00',
    endTime: '10:00',
    notes: 'Performance test'
  }));
  
  // Function to get test data for current request
  let currentIndex = 0;
  const getTestData = () => {
    const data = testData[currentIndex];
    currentIndex = (currentIndex + 1) % testData.length;
    return data;
  };
  
  const config = {
    ...baseConfig,
    title: 'Lesson Request',
    requests: [
      {
        method: 'POST',
        path: '/api/appointments/lesson-request',
        setupRequest: (req) => {
          req.body = JSON.stringify(getTestData());
          return req;
        }
      }
    ]
  };
  
  const results = await autocannonAsync(config);
  console.log(`
Lesson Request Test Results:
  Requests: ${results.requests.total}
  Throughput: ${results.requests.average} req/sec
  Latency Avg: ${results.latency.average} ms
  Latency Max: ${results.latency.max} ms
  Errors: ${results.errors}
  `);
  
  writeResults(results, 'lesson-request');
  return results;
};

// Test analytics event tracking
const testAnalyticsEvents = async () => {
  console.log('Testing POST /api/analytics/event endpoint...');
  
  const config = {
    ...baseConfig,
    title: 'Analytics Events',
    connections: 50, // Increase connections for analytics
    requests: [
      {
        method: 'POST',
        path: '/api/analytics/event',
        body: JSON.stringify({
          eventType: 'page_view',
          eventData: {
            page: '/home',
            referrer: 'https://google.com',
            userAgent: 'Mozilla/5.0'
          }
        })
      }
    ]
  };
  
  const results = await autocannonAsync(config);
  console.log(`
Analytics Events Test Results:
  Requests: ${results.requests.total}
  Throughput: ${results.requests.average} req/sec
  Latency Avg: ${results.latency.average} ms
  Latency Max: ${results.latency.max} ms
  Errors: ${results.errors}
  `);
  
  writeResults(results, 'analytics-events');
  return results;
};

// Run tests in sequence
const runLoadTests = async () => {
  try {
    // Run all tests
    await testAvailableTimes();
    await testFormSubmission();
    await testLessonRequest();
    await testAnalyticsEvents();
    
    console.log('All performance tests completed successfully!');
  } catch (error) {
    console.error('Error running performance tests:', error);
    process.exit(1);
  }
};

// Execute tests
runLoadTests();

// Export functions for programmatic use
module.exports = {
  testAvailableTimes,
  testFormSubmission,
  testLessonRequest,
  testAnalyticsEvents,
  runLoadTests
}; 