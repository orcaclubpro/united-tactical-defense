/**
 * Request logger middleware
 * Logs all incoming requests with method, path, and response time
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  // Log when the request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    console.log(`${method} ${originalUrl} - ${statusCode} - ${duration}ms - ${ip}`);
  });
  
  next();
};

module.exports = requestLogger; 