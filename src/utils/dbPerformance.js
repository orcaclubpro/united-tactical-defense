/**
 * Database Performance Testing and Monitoring Utility
 * Provides tools to test connection pooling, error handling, and performance
 */

const { initConnectionPool, withConnection, getConnection, releaseConnection } = require('../config/database');
const { executeWithRetry, executeTransaction } = require('./dbErrorHandler');

// Performance metrics
const metrics = {
  totalOperations: 0,
  successfulOperations: 0,
  failedOperations: 0,
  totalExecutionTimeMs: 0,
  operationTimes: [],
  maxConcurrentConnections: 0,
  currentConcurrentConnections: 0
};

/**
 * Reset performance metrics
 */
const resetMetrics = () => {
  metrics.totalOperations = 0;
  metrics.successfulOperations = 0;
  metrics.failedOperations = 0;
  metrics.totalExecutionTimeMs = 0;
  metrics.operationTimes = [];
  metrics.maxConcurrentConnections = 0;
  metrics.currentConcurrentConnections = 0;
};

/**
 * Track performance metrics for a database operation
 * @param {Function} operation The database operation to execute
 * @returns {Promise<any>} The operation result
 */
const trackPerformance = async (operation) => {
  metrics.totalOperations++;
  metrics.currentConcurrentConnections++;
  metrics.maxConcurrentConnections = Math.max(
    metrics.maxConcurrentConnections,
    metrics.currentConcurrentConnections
  );
  
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    
    metrics.successfulOperations++;
    metrics.totalExecutionTimeMs += executionTime;
    metrics.operationTimes.push(executionTime);
    
    return result;
  } catch (error) {
    metrics.failedOperations++;
    throw error;
  } finally {
    metrics.currentConcurrentConnections--;
  }
};

/**
 * Execute a database operation with performance tracking
 * @param {Function} operation The database operation to execute
 * @returns {Promise<any>} The operation result
 */
const executeWithTracking = async (operation) => {
  return trackPerformance(async () => {
    return executeWithRetry(operation);
  });
};

/**
 * Get performance statistics
 * @returns {Object} Performance statistics
 */
const getPerformanceStats = () => {
  const avgExecTime = metrics.successfulOperations > 0 
    ? metrics.totalExecutionTimeMs / metrics.successfulOperations
    : 0;
  
  // Calculate percentiles
  const sortedTimes = [...metrics.operationTimes].sort((a, b) => a - b);
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)] || 0;
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;
  
  return {
    totalOperations: metrics.totalOperations,
    successfulOperations: metrics.successfulOperations,
    failedOperations: metrics.failedOperations,
    successRate: metrics.totalOperations ? 
      (metrics.successfulOperations / metrics.totalOperations) * 100 : 0,
    averageExecutionTimeMs: avgExecTime,
    maxConcurrentConnections: metrics.maxConcurrentConnections,
    currentConcurrentConnections: metrics.currentConcurrentConnections,
    p50ExecutionTimeMs: p50,
    p95ExecutionTimeMs: p95,
    p99ExecutionTimeMs: p99
  };
};

/**
 * Run a load test on the database connection pool
 * @param {Function} queryFn The query function to execute
 * @param {Object} options Test options
 * @returns {Promise<Object>} Test results
 */
const runLoadTest = async (queryFn, options = {}) => {
  const concurrency = options.concurrency || 10;
  const iterations = options.iterations || 100;
  const delayMs = options.delayMs || 10;
  
  // Reset metrics
  resetMetrics();
  
  // Initialize connection pool with appropriate size
  await initConnectionPool(Math.max(10, concurrency));
  
  const startTime = Date.now();
  
  // Create batch of promises
  const createPromiseBatch = (batchSize) => {
    const batch = [];
    for (let i = 0; i < batchSize; i++) {
      batch.push(executeWithTracking((conn) => queryFn(conn, i)));
    }
    return batch;
  };
  
  // Process iterations in batches with concurrency control
  const results = [];
  for (let i = 0; i < iterations; i += concurrency) {
    const batchSize = Math.min(concurrency, iterations - i);
    const batch = createPromiseBatch(batchSize);
    
    // Execute batch
    const batchResults = await Promise.allSettled(batch);
    results.push(...batchResults);
    
    // Add small delay between batches to prevent overwhelming
    if (delayMs > 0 && i + concurrency < iterations) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  const endTime = Date.now();
  const totalTimeMs = endTime - startTime;
  
  return {
    totalTimeMs,
    operationsPerSecond: iterations / (totalTimeMs / 1000),
    metrics: getPerformanceStats(),
    successCount: results.filter(r => r.status === 'fulfilled').length,
    failureCount: results.filter(r => r.status === 'rejected').length
  };
};

/**
 * Simulate a database failure to test recovery
 * @returns {Promise<boolean>} True if recovery successful
 */
const simulateFailureAndRecovery = async () => {
  // Get connection from the pool
  const connection = await getConnection();
  
  try {
    // First query to ensure connection works
    await new Promise((resolve, reject) => {
      connection.get('SELECT 1 as test', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Simulate connection failure by forcibly closing 
    // The connection but not releasing it from pool
    connection.close();
    
    // Try another operation, which should fail and trigger retry
    try {
      await executeWithRetry(async (conn) => {
        return new Promise((resolve, reject) => {
          conn.get('SELECT 1 as test', (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      });
      
      // If we got here, recovery succeeded
      return true;
    } catch (err) {
      console.error('Recovery failed:', err);
      return false;
    }
  } finally {
    // Ensure connection is released
    try {
      releaseConnection(connection);
    } catch (e) {
      // Ignore error from releasing already closed connection
    }
  }
};

module.exports = {
  resetMetrics,
  executeWithTracking,
  getPerformanceStats,
  runLoadTest,
  simulateFailureAndRecovery
}; 