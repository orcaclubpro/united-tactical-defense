const { getTrackerScriptTag } = require('../utils/analyticsTracker');

/**
 * Middleware to inject analytics tracking script into HTML responses
 * @param {Object} options - Configuration options for the tracker
 * @returns {Function} - Express middleware function
 */
const analyticsInjector = (options = {}) => {
  const scriptTag = getTrackerScriptTag(options);
  
  return (req, res, next) => {
    // Save the original res.send function
    const originalSend = res.send;
    
    // Override the res.send function
    res.send = function(body) {
      // Only modify HTML responses
      if (res.get('Content-Type') && res.get('Content-Type').includes('text/html')) {
        // Check if body is a Buffer or string
        let html = body;
        if (Buffer.isBuffer(body)) {
          html = body.toString('utf8');
        }
        
        // Inject the analytics script before the closing </body> tag
        if (typeof html === 'string' && html.includes('</body>')) {
          const modified = html.replace('</body>', `${scriptTag}\n</body>`);
          
          // Update the Content-Length if it exists
          const contentLength = res.get('Content-Length');
          if (contentLength) {
            res.set('Content-Length', Buffer.byteLength(modified, 'utf8'));
          }
          
          // Call the original send function with the modified body
          return originalSend.call(this, modified);
        }
      }
      
      // Call the original send function for non-HTML responses
      return originalSend.call(this, body);
    };
    
    next();
  };
};

module.exports = analyticsInjector; 