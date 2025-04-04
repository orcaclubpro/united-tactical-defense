# Network Transaction Logging for Go High Level Integration

This document explains the enhanced logging features implemented for tracking form submissions to Go High Level.

## Overview

We've implemented comprehensive logging at three different levels to provide full visibility into network transactions:

1. **Frontend API Service Level** - Logs request data before it leaves the frontend
2. **Proxy Middleware Level** - Logs data as it passes through the HTTP proxy
3. **Backend Endpoint Level** - Logs data as it's forwarded to Go High Level

This multi-level approach ensures complete visibility of the data at each step of the submission process.

## 1. Frontend API Service Logging

In `frontend/src/services/api.ts`, the `submitFreeClassForm` function now includes detailed logging:

```typescript
export const submitFreeClassForm = async (formData: any) => {
  try {
    console.log('\n============ FRONTEND - FREE CLASS FORM SUBMISSION ============');
    console.log('Submitting data to backend endpoint: /api/forms/go-high-level-submit');
    console.log('Form Data:', JSON.stringify(formData, null, 2));
    
    // Track start time for performance monitoring
    const startTime = performance.now();
    
    // Request code here...
    
    // Calculate request duration
    const duration = performance.now() - startTime;
    
    // Log complete response details
    console.log('\n============ FRONTEND - RESPONSE RECEIVED ============');
    console.log(`Response received in ${duration.toFixed(2)}ms`);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('============ END FRONTEND LOGGING ============\n');
    
    // Function continues...
  }
}
```

This provides:
- Complete request data being sent
- Performance timing information
- Full response details including headers and body
- Detailed error handling with response info when available

## 2. Proxy Middleware Logging

In `frontend/src/setupProxy.js`, the Go High Level proxy middleware now includes extensive logging:

```javascript
const goHighLevelProxy = createProxyMiddleware({
  // Configuration...
  onProxyReq: (proxyReq, req, res) => {
    // Headers setup...
    
    console.log('\n============ GO HIGH LEVEL PROXY - REQUEST ============');
    console.log(`Proxying ${req.method} ${req.path} to ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
    
    // Log headers and body...
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('\n============ GO HIGH LEVEL PROXY - RESPONSE ============');
    console.log(`Response for ${req.method} ${req.path}: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
    
    // Log headers and capture response body...
  },
  onError: (err, req, res) => {
    console.error('\n============ GO HIGH LEVEL PROXY - ERROR ============');
    // Error logging...
  }
});
```

This provides:
- Visibility into the proxy transformation process
- Complete request headers and body after modification
- Full response data including headers and body
- Error details when proxy encounters issues

## 3. Backend Endpoint Logging

In `src/api/routes/formRoutes.js`, the direct Go High Level submission endpoint now includes detailed logging:

```javascript
router.post('/go-high-level-submit', async (req, res) => {
  try {
    console.log('\n============ GO HIGH LEVEL REQUEST ============');
    console.log('Request URL: https://backend.leadconnectorhq.com/forms/submit');
    console.log('Request Method: POST');
    console.log('Request Headers:', JSON.stringify({
      // Headers...
    }, null, 2));
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('============ END REQUEST ============\n');
    
    // Send request to Go High Level...
    
    console.log('\n============ GO HIGH LEVEL RESPONSE ============');
    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);
    console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('============ END RESPONSE ============\n');
    
    // Return response...
  } catch (error) {
    console.error('\n============ GO HIGH LEVEL ERROR ============');
    // Detailed error logging...
  }
});
```

This provides:
- Complete request data being sent to the external API
- Full response details from the external API
- Comprehensive error handling with different error types

## How to Use This Logging

To see the complete network transaction for a form submission:

1. Open your browser's developer console
2. Submit a form on the frontend
3. Check the console for multiple log sections:
   - Frontend submission logs
   - Proxy request/response logs
   - Backend request/response logs

This will show you the complete journey of the data from the frontend to Go High Level and back.

## Common Log Patterns

### Successful Submission

For a successful submission, you should see:

1. `FRONTEND - FREE CLASS FORM SUBMISSION` 
2. `GO HIGH LEVEL PROXY - REQUEST`
3. `GO HIGH LEVEL REQUEST` (from backend)
4. `GO HIGH LEVEL RESPONSE` (from backend)
5. `GO HIGH LEVEL PROXY - RESPONSE`
6. `FRONTEND - RESPONSE RECEIVED`

### Failed Submission

For a failed submission, you might see:

1. `FRONTEND - FREE CLASS FORM SUBMISSION` 
2. `GO HIGH LEVEL PROXY - REQUEST`
3. `GO HIGH LEVEL REQUEST` (from backend)
4. `GO HIGH LEVEL ERROR` (from backend)
5. `GO HIGH LEVEL PROXY - ERROR` (if proxy fails)
6. `FRONTEND - SUBMISSION ERROR`

## Troubleshooting with Logs

These enhanced logs help identify common issues:

1. **Data Format Errors**: Compare the request body at each step to find any transformation issues
2. **Header Problems**: Check if required headers are missing or modified
3. **Network Issues**: Look for connection errors in the backend logs
4. **API Response Errors**: See the exact error response from Go High Level
5. **Performance Concerns**: Check the timing information for slow requests 