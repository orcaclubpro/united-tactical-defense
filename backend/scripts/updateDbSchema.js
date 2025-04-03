const { getDbConnection } = require('../config/database');

async function updateSchema() {
  try {
    console.log('Starting database schema update...');
    const db = getDbConnection();

    // Check if is_landing_page column exists
    const tableInfo = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(page_visits)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const hasLandingPageColumn = tableInfo.some(col => col.name === 'is_landing_page');

    if (!hasLandingPageColumn) {
      console.log('Adding is_landing_page column to page_visits table...');
      await new Promise((resolve, reject) => {
        db.run("ALTER TABLE page_visits ADD COLUMN is_landing_page INTEGER DEFAULT 0", (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('Column added successfully.');
    } else {
      console.log('is_landing_page column already exists. Skipping...');
    }

    // Check if metrics_snapshots table exists
    const tableList = await new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const hasMetricsSnapshotsTable = tableList.some(table => table.name === 'metrics_snapshots');

    if (!hasMetricsSnapshotsTable) {
      console.log('Creating metrics_snapshots table...');
      await new Promise((resolve, reject) => {
        db.run(`
          CREATE TABLE metrics_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            landing_page_visits INTEGER NOT NULL,
            conversions INTEGER NOT NULL,
            referral_counts TEXT NOT NULL,
            report_type TEXT NOT NULL DEFAULT 'realtime',
            devices TEXT,
            geography TEXT,
            snapshot_time DATETIME NOT NULL
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('Table created successfully.');
    } else {
      // Check if report_type column exists
      const metricsTableInfo = await new Promise((resolve, reject) => {
        db.all("PRAGMA table_info(metrics_snapshots)", (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      
      const hasReportTypeColumn = metricsTableInfo.some(col => col.name === 'report_type');
      
      if (!hasReportTypeColumn) {
        console.log('Adding report_type column to metrics_snapshots table...');
        await new Promise((resolve, reject) => {
          db.run("ALTER TABLE metrics_snapshots ADD COLUMN report_type TEXT NOT NULL DEFAULT 'realtime'", (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        console.log('Column added successfully.');
      } else {
        console.log('report_type column already exists. Skipping...');
      }
      
      // Check if devices and geography columns exist
      const hasDevicesColumn = metricsTableInfo.some(col => col.name === 'devices');
      const hasGeographyColumn = metricsTableInfo.some(col => col.name === 'geography');
      
      if (!hasDevicesColumn) {
        console.log('Adding devices column to metrics_snapshots table...');
        await new Promise((resolve, reject) => {
          db.run("ALTER TABLE metrics_snapshots ADD COLUMN devices TEXT", (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        console.log('Column added successfully.');
      }
      
      if (!hasGeographyColumn) {
        console.log('Adding geography column to metrics_snapshots table...');
        await new Promise((resolve, reject) => {
          db.run("ALTER TABLE metrics_snapshots ADD COLUMN geography TEXT", (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        console.log('Column added successfully.');
      }
    }

    console.log('Database schema update completed successfully.');
    db.close();
  } catch (error) {
    console.error('Error updating database schema:', error);
    process.exit(1);
  }
}

// Run the update function
updateSchema(); 