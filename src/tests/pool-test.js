/**
 * Database Connection Pool Test Script
 * Tests database connection pooling, failure handling, and performance
 */

const { initConnectionPool, closeDatabase } = require('../config/database');
const { executeWithRetry, executeTransaction } = require('../utils/dbErrorHandler');
const { runLoadTest, simulateFailureAndRecovery } = require('../utils/dbPerformance');

/**
 * Simple query function for testing
 * @param {Object} conn Database connection
 * @param {number} id Query identifier
 * @returns {Promise<Object>} Query result
 */
const testQuery = (conn, id) => {
  return new Promise((resolve, reject) => {
    // Simulate varying query times
    const queryTime = Math.floor(Math.random() * 100) + 10;
    
    setTimeout(() => {
      conn.get('SELECT 1 as test', (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({ id, result: row, queryTime });
        }
      });
    }, queryTime);
  });
};

/**
 * Transaction test function
 * @param {Object} conn Database connection
 * @returns {Promise<boolean>} Success status
 */
const testTransaction = async (conn) => {
  return new Promise((resolve, reject) => {
    conn.run('BEGIN TRANSACTION', (err) => {
      if (err) return reject(err);
      
      conn.run('CREATE TABLE IF NOT EXISTS test_trans (id INTEGER PRIMARY KEY, value TEXT)', (err) => {
        if (err) {
          conn.run('ROLLBACK', () => reject(err));
          return;
        }
        
        const value = `test-${Date.now()}`;
        conn.run('INSERT INTO test_trans (value) VALUES (?)', [value], (err) => {
          if (err) {
            conn.run('ROLLBACK', () => reject(err));
            return;
          }
          
          conn.get('SELECT * FROM test_trans WHERE value = ?', [value], (err, row) => {
            if (err) {
              conn.run('ROLLBACK', () => reject(err));
              return;
            }
            
            conn.run('COMMIT', (err) => {
              if (err) {
                conn.run('ROLLBACK', () => reject(err));
                return;
              }
              
              resolve(true);
            });
          });
        });
      });
    });
  });
};

/**
 * Run connection pool tests
 */
const runTests = async () => {
  try {
    console.log('Initializing database connection pool...');
    await initConnectionPool(15);
    console.log('Database pool initialized successfully');
    
    // Test 1: Simple load test with low concurrency
    console.log('\n========== TEST 1: Basic Load Test ==========');
    const basicLoadResults = await runLoadTest(testQuery, { 
      concurrency: 5, 
      iterations: 20 
    });
    console.log('Basic load test results:');
    console.log(JSON.stringify(basicLoadResults, null, 2));
    
    // Test 2: Transaction test
    console.log('\n========== TEST 2: Transaction Test ==========');
    const transactionResult = await executeWithRetry(testTransaction);
    console.log('Transaction test result:', transactionResult);
    
    // Test 3: High concurrency test
    console.log('\n========== TEST 3: High Concurrency Test ==========');
    const highLoadResults = await runLoadTest(testQuery, { 
      concurrency: 15,
      iterations: 50 
    });
    console.log('High concurrency test results:');
    console.log(JSON.stringify(highLoadResults, null, 2));
    
    // Test 4: Failure recovery test
    console.log('\n========== TEST 4: Failure Recovery Test ==========');
    const recoveryResult = await simulateFailureAndRecovery();
    console.log('Recovery test result:', recoveryResult);
    
    // Test 5: Transaction with retry
    console.log('\n========== TEST 5: Transaction with Retry ==========');
    const transactionWithRetryResult = await executeTransaction(async (conn) => {
      return new Promise((resolve, reject) => {
        conn.get('SELECT 1 as transValue', (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    });
    console.log('Transaction with retry result:', transactionWithRetryResult);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await closeDatabase();
  }
};

// Run if called directly
if (require.main === module) {
  runTests()
    .then(() => {
      console.log('Tests completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Tests failed:', err);
      process.exit(1);
    });
} 