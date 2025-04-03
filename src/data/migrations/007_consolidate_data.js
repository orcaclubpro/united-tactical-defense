/**
 * Migration: Consolidate data from legacy database files
 * Migrates data from the root unitedDT.db and backend/unitedDT.db into the main database
 */

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Legacy database paths
const rootDbPath = path.join(process.cwd(), 'unitedDT.db');
const backendDbPath = path.join(process.cwd(), 'backend', 'unitedDT.db');

/**
 * Helper to check if a table exists in a database
 * @param {Object} db - Database connection
 * @param {string} tableName - Table name to check
 * @returns {Promise<boolean>} - Whether table exists
 */
const tableExists = (db, tableName) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      [tableName],
      (err, row) => {
        if (err) return reject(err);
        resolve(!!row);
      }
    );
  });
};

/**
 * Helper to extract all data from a table
 * @param {Object} db - Database connection
 * @param {string} tableName - Table to extract from
 * @returns {Promise<Array>} - Extracted rows
 */
const extractTableData = (db, tableName) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

/**
 * Helper to get the column names for a table
 * @param {Object} db - Database connection 
 * @param {string} tableName - Table name
 * @returns {Promise<Array>} - Column names
 */
const getTableColumns = (db, tableName) => {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName})`, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows.map(row => row.name));
    });
  });
};

/**
 * Import a table from one database to another
 * @param {Object} sourceDb - Source database
 * @param {Object} targetDb - Target database
 * @param {string} tableName - Table to import
 * @returns {Promise<number>} - Number of rows imported
 */
const importTable = async (sourceDb, targetDb, tableName) => {
  try {
    // Check if table exists in source
    const exists = await tableExists(sourceDb, tableName);
    if (!exists) {
      console.log(`Table '${tableName}' does not exist in source database, skipping...`);
      return 0;
    }
    
    // Get table columns and data
    const sourceColumns = await getTableColumns(sourceDb, tableName);
    const data = await extractTableData(sourceDb, tableName);
    
    if (data.length === 0) {
      console.log(`No data in table '${tableName}', skipping...`);
      return 0;
    }
    
    // Check if table exists in target
    const targetExists = await tableExists(targetDb, tableName);
    if (!targetExists) {
      console.log(`Table '${tableName}' does not exist in target database, skipping...`);
      return 0;
    }
    
    // Get target table columns to ensure proper mapping
    const targetColumns = await getTableColumns(targetDb, tableName);
    
    // Begin transaction
    await new Promise((resolve, reject) => {
      targetDb.run('BEGIN TRANSACTION', err => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    // Column name mapping for known schema differences
    const columnMappings = {
      leads: {
        firstName: 'first_name',
        lastName: 'last_name',
        phoneNumber: 'phone_number',
        assignedTo: 'assigned_to',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      },
      appointments: {
        leadId: 'lead_id',
        userId: 'user_id',
        timeSlot: 'time_slot',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      },
      forms: {
        submittedAt: 'submitted_at',
        processingResult: 'processing_result',
        forwardingResult: 'forwarding_result',
        convertedTo: 'converted_to',
        ipAddress: 'ip_address',
        userAgent: 'user_agent',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    };
    
    // Import data
    let imported = 0;
    for (const row of data) {
      try {
        // Map the source row to the target schema
        const targetRow = {};
        
        sourceColumns.forEach(sourceCol => {
          // If we have a mapping for this table and column, use it
          if (columnMappings[tableName] && columnMappings[tableName][sourceCol]) {
            const targetCol = columnMappings[tableName][sourceCol];
            if (targetColumns.includes(targetCol)) {
              targetRow[targetCol] = row[sourceCol];
            }
          } else if (targetColumns.includes(sourceCol)) {
            // Direct column name match
            targetRow[sourceCol] = row[sourceCol];
          }
        });
        
        // If we couldn't map any columns, skip this row
        const mappedColumns = Object.keys(targetRow);
        if (mappedColumns.length === 0) {
          console.log(`No mappable columns for row in ${tableName}, skipping`);
          continue;
        }
        
        // Prepare SQL for this row
        const columnNames = mappedColumns.join(', ');
        const placeholders = mappedColumns.map(() => '?').join(', ');
        const values = mappedColumns.map(col => targetRow[col]);
        
        await new Promise((resolve, reject) => {
          targetDb.run(
            `INSERT OR IGNORE INTO ${tableName} (${columnNames}) VALUES (${placeholders})`,
            values,
            function(err) {
              if (err) return reject(err);
              if (this.changes > 0) imported++;
              resolve();
            }
          );
        });
      } catch (err) {
        console.error(`Error importing row to ${tableName}:`, err);
      }
    }
    
    // Commit transaction
    await new Promise((resolve, reject) => {
      targetDb.run('COMMIT', err => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    console.log(`Imported ${imported} rows into '${tableName}'`);
    return imported;
  } catch (err) {
    console.error(`Error importing table '${tableName}':`, err);
    
    // Rollback transaction on error
    try {
      await new Promise(resolve => {
        targetDb.run('ROLLBACK', () => resolve());
      });
    } catch (rollbackErr) {
      console.error('Error rolling back transaction:', rollbackErr);
    }
    
    return 0;
  }
};

/**
 * Migration up function
 * @param {Object} db - Target database connection
 */
const up = async (db) => {
  console.log('Starting data consolidation from legacy databases...');
  const importedData = { root: {}, backend: {} };
  
  // Process root database if it exists
  if (fs.existsSync(rootDbPath)) {
    console.log(`Found legacy database at ${rootDbPath}`);
    const rootDb = new sqlite3.Database(rootDbPath);
    
    // Tables to import from root database
    const rootTables = ['leads', 'appointments', 'page_visits', 'page_engagement'];
    
    for (const table of rootTables) {
      importedData.root[table] = await importTable(rootDb, db, table);
    }
    
    // Close connection
    await new Promise(resolve => rootDb.close(resolve));
    console.log('Legacy root database processed');
  } else {
    console.log('No legacy root database found');
  }
  
  // Process backend database if it exists
  if (fs.existsSync(backendDbPath)) {
    console.log(`Found legacy database at ${backendDbPath}`);
    const backendDb = new sqlite3.Database(backendDbPath);
    
    // Tables to import from backend database
    const backendTables = ['leads', 'appointments', 'page_visits', 'page_engagement', 'forms'];
    
    for (const table of backendTables) {
      importedData.backend[table] = await importTable(backendDb, db, table);
    }
    
    // Close connection
    await new Promise(resolve => backendDb.close(resolve));
    console.log('Legacy backend database processed');
  } else {
    console.log('No legacy backend database found');
  }
  
  console.log('Data consolidation complete');
  console.log('Imported data summary:', JSON.stringify(importedData, null, 2));
};

/**
 * Migration down function (no-op, as we can't un-merge data)
 */
const down = async () => {
  console.log('Data consolidation cannot be rolled back');
};

module.exports = {
  up,
  down,
  name: '006_consolidate_data'
}; 