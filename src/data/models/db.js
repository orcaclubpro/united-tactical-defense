/**
 * Database Access Module
 * Provides wrapper functions around SQLite database operations
 */

const { getDatabase } = require('../../config/database');

/**
 * Execute a query and get all results
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} - Query results
 */
const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Database query error:', err.message);
        return reject(err);
      }
      resolve(rows);
    });
  });
};

/**
 * Execute a query and get the first result
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} - Single result or null
 */
const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Database query error:', err.message);
        return reject(err);
      }
      resolve(row || null);
    });
  });
};

/**
 * Execute a query that modifies the database
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Result with lastID and changes
 */
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Database query error:', err.message);
        return reject(err);
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

/**
 * Execute multiple statements in a transaction
 * @param {Function} callback - Callback function that receives transaction object
 * @returns {Promise<any>} - Result from the callback
 */
const transaction = async (callback) => {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      Promise.resolve()
        .then(() => callback({
          all: all,
          get: get,
          run: run
        }))
        .then((result) => {
          db.run('COMMIT', (err) => {
            if (err) {
              console.error('Error committing transaction:', err);
              return reject(err);
            }
            resolve(result);
          });
        })
        .catch((err) => {
          console.error('Error in transaction:', err);
          db.run('ROLLBACK', (rollbackErr) => {
            if (rollbackErr) {
              console.error('Error rolling back transaction:', rollbackErr);
            }
            reject(err);
          });
        });
    });
  });
};

module.exports = {
  all,
  get,
  run,
  transaction
}; 