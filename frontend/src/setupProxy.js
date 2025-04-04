const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Simple direct proxy for Go High Level form submissions
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
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[Go High Level Proxy] Response: ${proxyRes.statusCode} for ${req.method} ${req.path}`);
    },
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

  // Proxy for local API endpoints
  const apiProxy = createProxyMiddleware({
    target: 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '' // Remove the /api prefix when forwarding to the backend
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[API Proxy] Request: ${req.method} ${req.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[API Proxy] Response: ${proxyRes.statusCode} for ${req.method} ${req.path}`);
    },
    onError: (err, req, res) => {
      console.error('[API Proxy] Error:', err);
      res.writeHead(500, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'Proxy error connecting to backend API',
        error: err.message
      }));
    }
  });
  
  // Apply proxies - order matters! Specific routes must come before more general ones
  app.use('/api/form/free-class', goHighLevelProxy);
  app.use('/api', apiProxy);
}; 