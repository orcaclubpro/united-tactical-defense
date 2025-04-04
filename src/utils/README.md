# Utility Modules

This directory contains utility modules used across the application.

## Database Utilities

### Database Error Handler (`dbErrorHandler.js`)

The database error handler provides robust error handling and recovery mechanisms for database operations. It implements:

- **Error Classification**: Automatically classifies database errors by type for proper handling
- **Automatic Retries**: Retries failed operations with configurable retry limits
- **Exponential Backoff**: Implements exponential backoff for more efficient retries
- **Transaction Support**: Provides transaction wrappers with automatic rollback on failure

**Usage Example:**

```javascript
const { executeWithRetry, executeTransaction } = require('../utils/dbErrorHandler');

// Simple operation with retry
const result = await executeWithRetry(async (connection) => {
  return new Promise((resolve, reject) => {
    connection.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
});

// Transaction with automatic rollback on error
const result = await executeTransaction(async (connection) => {
  return new Promise((resolve, reject) => {
    // Execute multiple operations in a transaction
    // Any error will cause automatic rollback
  });
});
```

### Database Performance Utilities (`dbPerformance.js`)

The database performance module provides tools for testing and analyzing database performance:

- **Performance Tracking**: Tracks operation times, success rates, and concurrency levels
- **Load Testing**: Simulates concurrent database operations for performance testing
- **Metrics Collection**: Collects and reports detailed performance metrics
- **Failure Simulation**: Tests error recovery and connection failover

**Usage Example:**

```javascript
const { runLoadTest, getPerformanceStats } = require('../utils/dbPerformance');

// Define query function
const queryFn = (connection, id) => {
  return new Promise((resolve, reject) => {
    connection.get('SELECT * FROM users LIMIT 1', (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

// Run load test
const results = await runLoadTest(queryFn, {
  concurrency: 10,  // 10 concurrent operations
  iterations: 100   // 100 total iterations
});

console.log(results);
// {
//   totalTimeMs: 1234,
//   operationsPerSecond: 81.03,
//   metrics: { ... },
//   successCount: 100,
//   failureCount: 0
// }
```

## Best Practices for Database Operations

1. **Always use connection pooling**: Use the connection pool for all database operations to improve performance and reliability.

2. **Handle errors properly**: Use the error handling utilities to ensure proper error recovery.

3. **Use transactions for multi-step operations**: Wrap related operations in transactions to ensure data consistency.

4. **Release connections**: Always ensure connections are released back to the pool after use.

5. **Monitor performance**: Use the performance utilities to identify and address performance bottlenecks. 