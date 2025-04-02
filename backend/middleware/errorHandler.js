/**
 * Global error handler middleware
 * Catches and formats all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
  // Set default status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log the error
  console.error(`Error ${statusCode}: ${message}`);
  if (err.stack) {
    console.error(err.stack);
  }
  
  // Send error response to client
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: statusCode,
      // Only include stack trace in development
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler; 