# Form Submission Integration Documentation

## Overview

This document explains the recent changes made to fix connection issues between our frontend application and backend services, particularly focusing on:

1. Proxy configuration for form submissions to Go High Level
2. Direct server-side endpoint implementation for more reliable form submission
3. Frontend API implementation updates

## Issues Addressed

The following issues were addressed with these changes:

1. **Connection refused errors** when proxying requests to the analytics service on port 3004
2. **500 server errors** when submitting forms to Go High Level's API
3. **Bind errors** in the form controller routes

## Implementation Details

### 1. Enhanced Proxy Configuration

The proxy configuration in `frontend/src/setupProxy.js` was updated to:

- Add proper headers required by Go High Level (Origin, Referer)
- Improve error handling to provide more useful feedback
- Ensure the proper path rewriting for form submissions

```javascript
const goHighLevelProxy = createProxyMiddleware({
  target: 'https://backend.leadconnectorhq.com',
  changeOrigin: true,
  secure: true,
  logLevel: 'debug',
  pathRewrite: {
    '^/api/form/free-class': '/forms/submit'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add required headers
    proxyReq.setHeader('Origin', 'https://unitedtacticaldefense.com');
    proxyReq.setHeader('Referer', 'https://unitedtacticaldefense.com/');
    console.log(`[Go High Level Proxy] Request: ${req.method} ${req.path}`);
  },
  // Error handling code added
  onError: (err, req, res) => {
    console.error('[Go High Level Proxy] Error:', err);
    res.writeHead(500, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({ 
      success: false, 
      message: 'Proxy error connecting to Go High Level',
      error: err.message
    }));
  }
});
```

### 2. Direct Server-Side Endpoint

A new endpoint was added to the backend to bypass the proxy middleware and directly forward requests to Go High Level:

```javascript
// Direct Go High Level form submission endpoint in src/api/routes/formRoutes.js
router.post('/go-high-level-submit', async (req, res) => {
  try {
    console.log('Forwarding request directly to Go High Level');
    
    const response = await axios.post(
      'https://backend.leadconnectorhq.com/forms/submit',
      req.body,
      {
        headers: {
          'Content-Type': req.headers['content-type'],
          'User-Agent': req.headers['user-agent'],
          'Origin': 'https://unitedtacticaldefense.com',
          'Referer': 'https://unitedtacticaldefense.com/',
          'Accept': req.headers['accept'],
          'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.5',
        }
      }
    );
    
    return res.status(response.status).json(response.data);
  } catch (error) {
    // Error handling code
  }
});
```

### 3. Frontend API Updates

The frontend API service was updated to use the new direct endpoint instead of the Go High Level adapter:

```typescript
export const submitFreeClassForm = async (formData: any) => {
  try {
    console.log('Submitting free class form data via direct endpoint');
    
    // Use our backend endpoint that directly forwards to Go High Level
    const response = await api.post('/api/forms/go-high-level-submit', formData);
    
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    console.error('Error in free class form submission:', error);
    throw error;
  }
};
```

### 4. Backend Form Controller Fix

Fixed an error in the `formRoutes.js` file where the `bind` method was being called on an undefined object:

```javascript
// Before
router.post(
  '/process',
  validate({
    body: Joi.object({
      type: Joi.string().required(),
      data: Joi.object().required()
    })
  }),
  formController.processForm.bind(formController)  // This caused an error
);

// After
router.post(
  '/process',
  validate({
    body: Joi.object({
      type: Joi.string().required(),
      data: Joi.object().required()
    })
  }),
  formController.processForm  // Fixed
);
```

## Testing

To test these changes:

1. Start the backend server: `cd src && node server.js`
2. Start the frontend: `cd frontend && npm start`
3. Submit a form on the frontend
4. Check the backend logs for the successful request forwarding
5. Verify the response from Go High Level

## Troubleshooting

If issues persist:

1. Check that the backend server is running on port 3004
2. Verify that the correct headers are being sent to Go High Level
3. Check the browser console for any CORS or network errors
4. Confirm that the Go High Level API hasn't changed its requirements 