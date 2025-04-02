const db = require('../config/database');

async function updateSchema() {
  try {
    console.log('Starting database schema update...');

    // Check if is_landing_page column exists
    const tableInfo = await db.all("PRAGMA table_info(page_visits)");
    const hasLandingPageColumn = tableInfo.some(col => col.name === 'is_landing_page');

    if (!hasLandingPageColumn) {
      console.log('Adding is_landing_page column to page_visits table...');
      await db.run("ALTER TABLE page_visits ADD COLUMN is_landing_page INTEGER DEFAULT 0");
      console.log('Column added successfully.');
    } else {
      console.log('is_landing_page column already exists. Skipping...');
    }

    // Check if metrics_snapshots table exists
    const tableList = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    const hasMetricsSnapshotsTable = tableList.some(table => table.name === 'metrics_snapshots');

    if (!hasMetricsSnapshotsTable) {
      console.log('Creating metrics_snapshots table...');
      await db.run(`
        CREATE TABLE metrics_snapshots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          landing_page_visits INTEGER NOT NULL,
          conversions INTEGER NOT NULL,
          referral_counts TEXT NOT NULL,
          snapshot_time DATETIME NOT NULL
        )
      `);
      console.log('Table created successfully.');
    } else {
      console.log('metrics_snapshots table already exists. Skipping...');
    }

    console.log('Database schema update completed successfully.');
  } catch (error) {
    console.error('Error updating database schema:', error);
    process.exit(1);
  }
}

updateSchema(); 