/**
 * =====================================================
 * DATABASE INITIALIZATION SCRIPT
 * =====================================================
 * 
 * Run this script to create and populate the database:
 * npm run init-db
 * 
 * @author ServerPE
 */

const path = require('path');
const { initializeDatabase, getDb, closeDb } = require('./db');

console.log('╔════════════════════════════════════════════════╗');
console.log('║   DATABASE INITIALIZATION                      ║');
console.log('╚════════════════════════════════════════════════╝');

try {
    // Initialize schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    initializeDatabase(schemaPath);
    
    // Verify tables
    const db = getDb();
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('\n📋 Created Tables:');
    tables.forEach(t => console.log(`   - ${t.name}`));
    
    // Count records
    const trainCount = db.prepare('SELECT COUNT(*) as count FROM trains').get();
    const stationCount = db.prepare('SELECT COUNT(*) as count FROM stations').get();
    
    console.log(`\n📊 Data Summary:`);
    console.log(`   - Trains: ${trainCount.count}`);
    console.log(`   - Stations: ${stationCount.count}`);
    
    console.log('\n✅ Database initialization complete!');
    
} catch (error) {
    console.error('❌ Initialization failed:', error.message);
    process.exit(1);
} finally {
    closeDb();
}
