/**
 * Database Error Handler Utility
 * Handles database connection errors, retries, and recovery strategies
 */

const { getConnection, releaseConnection, initConnectionPool } = require('../config/database');

// Configuration
const config = {
  maxRetries: 5,
  retryDelayMs: 500,
  exponentialBackoff: true,
  errorLogLevel: 'warn',
  criticalErrorLogLevel: 'error'
};

// Error types
const DB_ERROR_TYPES = {
  CONNECTION: 'CONNECTION_ERROR',
  QUERY: 'QUERY_ERROR',
  TRANSACTION: 'TRANSACTION_ERROR',
  CONSTRAINT: 'CONSTRAINT_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * Classify database error by type
 * @param {Error} error The error to classify
 * @returns {string} The error type
 */
const classifyError = (error) => {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('connection') || errorMessage.includes('timeout')) {
    return DB_ERROR_TYPES.CONNECTION;
  } else if (errorMessage.includes('constraint') || errorMessage.includes('unique')) {
    return DB_ERROR_TYPES.CONSTRAINT;
  } else if (errorMessage.includes('transaction')) {
    return DB_ERROR_TYPES.TRANSACTION;
  } else if (errorMessage.includes('query') || errorMessage.includes('sql')) {
    return DB_ERROR_TYPES.QUERY;
  } else if (errorMessage.includes('timeout')) {
    return DB_ERROR_TYPES.TIMEOUT;
  } else {
    return DB_ERROR_TYPES.UNKNOWN;
  }
};

/**
 * Calculate retry delay with exponential backoff
 * @param {number} attempt Current attempt number
 * @returns {number} Delay in milliseconds
 */
const calculateRetryDelay = (attempt) => {
  if (config.exponentialBackoff) {
    return Math.min(Math.pow(2, attempt) * config.retryDelayMs, 30000); // Max 30 seconds
  }
  return config.retryDelayMs;
};

/**
 * Log database error with appropriate level
 * @param {Error} error The error to log
 * @param {string} errorType The classified error type
 * @param {number} attempt Current attempt number
 */
const logDbError = (error, errorType, attempt = 0) => {
  const isCritical = attempt >= config.maxRetries || 
                     errorType === DB_ERROR_TYPES.CONSTRAINT;
  
  const logLevel = isCritical ? config.criticalErrorLogLevel : config.errorLogLevel;
  const attemptInfo = attempt > 0 ? ` (Attempt ${attempt}/${config.maxRetries})` : '';
  
  if (logLevel === 'error') {
    console.error(`Database ${errorType}${attemptInfo}:`, error.message);
  } else {
    console.warn(`Database ${errorType}${attemptInfo}:`, error.message);
  }
};

/**
 * Execute database operation with automatic retry on failure
 * @param {Function} operation Database operation to execute
 * @param {Object} options Retry options
 * @returns {Promise<any>} Operation result
 */
const executeWithRetry = async (operation, options = {}) => {
  const maxRetries = options.maxRetries || config.maxRetries;
  let attempts = 0;
  
  while (true) {
    try {
      const connection = await getConnection();
      
      try {
        // Execute the operation with the connection
        const result = await operation(connection);
        releaseConnection(connection);
        return result;
      } catch (error) {
        releaseConnection(connection);
        throw error;
      }
    } catch (error) {
      attempts++;
      const errorType = classifyError(error);
      logDbError(error, errorType, attempts);
      
      // If max retries reached or not a retriable error, throw
      if (attempts >= maxRetries || errorType === DB_ERROR_TYPES.CONSTRAINT) {
        throw error;
      }
      
      // For connection errors, try to reinitialize the pool
      if (errorType === DB_ERROR_TYPES.CONNECTION && attempts === 1) {
        try {
          await initConnectionPool();
        } catch (poolError) {
          console.error('Failed to reinitialize connection pool:', poolError);
        }
      }
      
      // Wait before retrying
      const delay = calculateRetryDelay(attempts);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Execute a database transaction with retry
 * @param {Function} transactionFn Function to execute within transaction
 * @returns {Promise<any>} Transaction result
 */
const executeTransaction = async (transactionFn) => {
  return executeWithRetry(async (connection) => {
    return new Promise((resolve, reject) => {
      connection.run('BEGIN TRANSACTION', async (err) => {
        if (err) return reject(err);
        
        try {
          // Execute transaction function
          const result = await transactionFn(connection);
          
          // Commit the transaction
          connection.run('COMMIT', (commitErr) => {
            if (commitErr) {
              connection.run('ROLLBACK', () => reject(commitErr));
            } else {
              resolve(result);
            }
          });
        } catch (error) {
          // Rollback on error
          connection.run('ROLLBACK', () => reject(error));
        }
      });
    });
  });
};

module.exports = {
  DB_ERROR_TYPES,
  executeWithRetry,
  executeTransaction,
  calculateRetryDelay,
  classifyError
}; 